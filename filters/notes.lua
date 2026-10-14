--[[
notes.lua — фильтр pandoc для конспектов и реестров теории.

Что делает:
  * нумерует блоки (definition, axiom, theorem, lemma, proposition, corollary,
    example, remark, problem) одним сквозным счётчиком «лекция.N»;
    рисунки (```tikz) и формулы ($$…$$ {#eq:…}) — отдельными счётчиками;
  * превращает блоки в окружения notes.sty (LaTeX) или в размеченные div (HTML);
  * разрешает ссылки @label / [-@label] внутри лекции и между лекциями курса
    через общий индекс;
  * в режиме index выгружает метки и глоссарий в JSON (для индекса курса);
  * в режиме render (html) пишет sidecar JSON: оглавление, метки, глоссарий,
    рисунки TikZ, которые надо скомпилировать в SVG.

Метаданные, которые передаёт scripts/build.py через -M:
  notes_mode   index | render
  notes_out    путь JSON-выгрузки (index) или sidecar (render, html)
  notes_index  путь build/index.json (render)
  notes_config путь templates/courses.json
  week_id      имя файла без расширения
  site_url     (необязательно) базовый URL сайта для ссылок между лекциями в PDF
]]

local stringify = pandoc.utils.stringify

local BLOCKS = {
  definition  = { name = 'Определение', prefix = 'def',  style = 'definition' },
  axiom       = { name = 'Аксиома',     prefix = 'ax',   style = 'definition' },
  theorem     = { name = 'Теорема',     prefix = 'thm',  style = 'theorem' },
  lemma       = { name = 'Лемма',       prefix = 'lem',  style = 'theorem' },
  proposition = { name = 'Утверждение', prefix = 'prop', style = 'theorem' },
  corollary   = { name = 'Следствие',   prefix = 'cor',  style = 'theorem' },
  example     = { name = 'Пример',      prefix = 'ex',   style = 'example' },
  remark      = { name = 'Замечание',   prefix = 'rem',  style = 'remark' },
  problem     = { name = 'Задача',      prefix = 'prob', style = 'problem' },
}
local BLOCK_ORDER = { 'definition', 'axiom', 'theorem', 'lemma', 'proposition',
  'corollary', 'example', 'remark', 'problem' }

local TAGS = {
  ['корнер-кейс']         = 'corner-case',
  ['подводный камень']    = 'pitfall',
  ['частое заблуждение']  = 'misconception',
  ['соглашение курса']    = 'convention',
  ['напоминание']         = 'reminder',
}

local MONTHS = { 'января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля',
  'августа', 'сентября', 'октября', 'ноября', 'декабря' }

local FORMAT_LATEX = FORMAT:match('latex') ~= nil
local FORMAT_HTML = FORMAT:match('html') ~= nil

local errors = {}
local function err(msg)
  table.insert(errors, msg)
  io.stderr:write('[notes.lua] ERROR: ' .. msg .. '\n')
end

local function read_json(path)
  local f = io.open(path, 'r')
  if not f then return nil end
  local s = f:read('a')
  f:close()
  return pandoc.json.decode(s, false)
end

local function write_json(path, value)
  local f = assert(io.open(path, 'w'))
  f:write(pandoc.json.encode(value))
  f:close()
end

local function meta_str(meta, key)
  local v = meta[key]
  if v == nil then return nil end
  return stringify(v)
end

local function block_type(div)
  for _, cls in ipairs(div.classes) do
    if BLOCKS[cls] then return cls end
  end
  return nil
end

local function has_class(el, cls)
  for _, c in ipairs(el.classes or {}) do
    if c == cls then return true end
  end
  return false
end

local function md_inlines(text)
  if text == nil or text == '' then return pandoc.Inlines {} end
  local doc = pandoc.read(text, 'markdown')
  if #doc.blocks == 0 then return pandoc.Inlines {} end
  return doc.blocks[1].content or pandoc.Inlines {}
end

local function writer_opts(fmt)
  if fmt:match('html') then return { html_math_method = 'katex' } end
  return {}
end

local function inlines_to(fmt, inlines)
  local out = pandoc.write(pandoc.Pandoc { pandoc.Plain(inlines) }, fmt, writer_opts(fmt))
  return (out:gsub('%s+$', ''))
end

local function blocks_to(fmt, blocks)
  return (pandoc.write(pandoc.Pandoc(blocks), fmt, writer_opts(fmt)):gsub('%s+$', ''))
end

local function latex_escape(s)
  return (s:gsub('[\\{}%%#&_%$%^~]', function(c)
    if c == '\\' then return '\\textbackslash{}' end
    if c == '^' then return '\\^{}' end
    if c == '~' then return '\\~{}' end
    return '\\' .. c
  end))
end

local function int_str(x)
  local n = tonumber(x)
  if n and n == math.floor(n) then return string.format('%d', n) end
  return tostring(x)
end

local function date_ru(iso)
  if not iso then return '' end
  local y, m, d = iso:match('^(%d+)-(%d+)-(%d+)$')
  if not y then return iso end
  return tostring(tonumber(d)) .. ' ' .. MONTHS[tonumber(m)] .. ' ' .. y
end

-- ---------------------------------------------------------------------------
-- состояние документа
-- ---------------------------------------------------------------------------

local S = {
  mode = 'render',
  kind = 'notes',          -- notes | registry
  course = nil,
  lecture = nil,
  week_id = nil,
  basis = 'lecture',
  site_url = nil,
  labels = {},              -- id -> запись (метки этого документа)
  label_order = {},
  index = {},               -- глобальный индекс: course -> id -> запись
  glossary = {},
  toc = {},
  figures = {},
}

local function lecture_prefix()
  return tostring(S.lecture)
end

local function new_counters()
  return { block = 0, fig = 0, eq = 0 }
end

-- Номер «лекция.N» (одинаковая логика в обоих проходах)
local function next_number(counters, kind)
  counters[kind] = counters[kind] + 1
  return lecture_prefix() .. '.' .. counters[kind]
end

local function is_numbered_div(div)
  return block_type(div) ~= nil and not has_class(div, 'unnumbered')
    and div.attributes['ref'] == nil
end

local function eq_label_at(inlines, i)
  -- Math(DisplayMath) [Space] Str("{#eq:...}")
  local el = inlines[i]
  if not (el and el.t == 'Math' and el.mathtype == 'DisplayMath') then return nil end
  local j = i + 1
  if inlines[j] and (inlines[j].t == 'Space' or inlines[j].t == 'SoftBreak') then j = j + 1 end
  local s = inlines[j]
  if s and s.t == 'Str' then
    local id = s.text:match('^{#(eq:[%w%-:_%.]+)}$')
    if id then return id, j end
  end
  return nil
end

local function header_text(entry)
  -- «Теорема 4.3 (о базисном миноре)»
  local parts = {}
  if entry.tag and entry.tag ~= '' then table.insert(parts, entry.tag) end
  if entry.title and entry.title ~= '' then table.insert(parts, entry.title) end
  return parts
end

-- ---------------------------------------------------------------------------
-- проход 1: сбор меток
-- ---------------------------------------------------------------------------

local function record_label(id, entry)
  if id == nil or id == '' then return end
  if S.labels[id] then
    err('метка ' .. id .. ' встречается дважды')
    return
  end
  entry.id = id
  S.labels[id] = entry
  table.insert(S.label_order, id)
end

local function collect(doc)
  local c = new_counters()
  doc:walk {
    traverse = 'topdown',
    Div = function(div)
      if is_numbered_div(div) then
        local t = block_type(div)
        local num = next_number(c, 'block')
        record_label(div.identifier, {
          type = t, name = BLOCKS[t].name, number = num,
          title = div.attributes['title'] or '',
          tag = div.attributes['tag'] or '',
        })
      end
    end,
    CodeBlock = function(cb)
      if has_class(cb, 'tikz') then
        local num = next_number(c, 'fig')
        record_label(cb.identifier, {
          type = 'figure', name = 'Рис.', number = num,
          title = cb.attributes['caption'] or '',
        })
      end
    end,
    Inlines = function(inlines)
      for i = 1, #inlines do
        local id = eq_label_at(inlines, i)
        if id then
          local num = next_number(c, 'eq')
          record_label(id, { type = 'equation', name = 'формула', number = num, title = '' })
        end
      end
    end,
    Header = function(h)
      if h.identifier:match('^sec:') then
        record_label(h.identifier, {
          type = 'section', name = 'раздел', number = '', title = stringify(h.content),
        })
      end
    end,
  }
end

local function collect_glossary(doc, fmt)
  fmt = fmt or 'markdown'
  local in_glossary = false
  local entries = {}
  for _, blk in ipairs(doc.blocks) do
    if blk.t == 'Header' and blk.level == 1 then
      in_glossary = stringify(blk.content) == 'Глоссарий'
    elseif in_glossary and blk.t == 'DefinitionList' then
      for _, item in ipairs(blk.content) do
        local term, defs = item[1], item[2]
        local def_blocks = pandoc.Blocks {}
        for _, d in ipairs(defs) do def_blocks:extend(d) end
        if fmt == 'markdown' then
          table.insert(entries, {
            term = stringify(term),
            term_md = inlines_to('markdown', term),
            def_md = blocks_to('markdown', def_blocks),
          })
        else
          table.insert(entries, {
            term = stringify(term),
            term_html = inlines_to(fmt, term),
            def_html = blocks_to(fmt, def_blocks),
          })
        end
      end
    end
  end
  return entries
end

-- ---------------------------------------------------------------------------
-- разрешение ссылок
-- ---------------------------------------------------------------------------

local function lookup(id)
  local local_entry = S.labels[id]
  if local_entry then return local_entry, true end
  local course_index = S.index[S.course or ''] or {}
  local e = course_index[id]
  if e then
    return e, (S.kind == 'notes' and e.week_id == S.week_id)
  end
  return nil
end

local function ref_text(entry, suppress, same_lecture)
  local text
  if entry.type == 'section' then
    text = '«' .. entry.title .. '»'
  elseif entry.type == 'equation' then
    text = '(' .. entry.number .. ')'
  elseif suppress then
    text = entry.number
  else
    text = entry.name .. '\u{00A0}' .. entry.number
  end
  if not same_lecture and entry.lecture then
    text = text .. ' (лекция\u{00A0}' .. int_str(entry.lecture) .. ')'
  end
  return text
end

local function ref_href(entry, same_lecture)
  if same_lecture then return '#' .. entry.id end
  if FORMAT_HTML then
    return '../' .. entry.week_id .. '/#' .. entry.id
  end
  if S.site_url then
    return S.site_url .. '/' .. S.course .. '/' .. entry.week_id .. '/#' .. entry.id
  end
  return nil
end

local function resolve_cite(cite)
  local out = pandoc.Inlines {}
  for k, c in ipairs(cite.citations) do
    local id = c.id
    local entry, same = lookup(id)
    if not entry then
      if S.mode == 'render' then err('неизвестная ссылка @' .. id) end
      out:insert(pandoc.Strong { pandoc.Str('??' .. id) })
    else
      local suppress = c.mode == 'SuppressAuthor'
      local text = ref_text(entry, suppress, same)
      local inl = pandoc.Inlines {}
      if c.prefix and #c.prefix > 0 then inl:extend(c.prefix); inl:insert(pandoc.Space()) end
      local href = ref_href(entry, same)
      local label = pandoc.Inlines { pandoc.Str(text) }
      if href then
        inl:insert(pandoc.Link(label, href, '', { class = 'ref', ['data-ref'] = id }))
      else
        inl:insert(pandoc.Span(label, { class = 'ref', ['data-ref'] = id }))
      end
      if c.suffix and #c.suffix > 0 then inl:extend(c.suffix) end
      if k > 1 then out:insert(pandoc.Str(',')); out:insert(pandoc.Space()) end
      out:extend(inl)
    end
  end
  return out
end

-- ---------------------------------------------------------------------------
-- проход 2: рендер
-- ---------------------------------------------------------------------------

-- заголовки и подписи собираются из строк атрибутов: ссылки в них разрешаем сразу
local function md_inlines_resolved(text)
  return md_inlines(text):walk { Cite = resolve_cite }
end

local function head_inlines(name, number, parts)
  local inl = pandoc.Inlines { pandoc.Str(name) }
  if number and number ~= '' then
    inl:insert(pandoc.Str('\u{00A0}' .. number))
  end
  if #parts > 0 then
    inl:insert(pandoc.Space())
    inl:insert(pandoc.Str('('))
    for i, p in ipairs(parts) do
      if i > 1 then inl:insert(pandoc.Str(';')); inl:insert(pandoc.Space()) end
      inl:extend(md_inlines_resolved(p))
    end
    inl:insert(pandoc.Str(')'))
  end
  return inl
end

local function render_box(div, t, number, parts, extra)
  -- extra: { badge = 'черновик', note = Inlines } (для реестра)
  local style = BLOCKS[t].style
  local tag_slug = TAGS[div.attributes['tag'] or ''] or ''
  local id = div.identifier
  local head = head_inlines(BLOCKS[t].name, number, parts)
  extra = extra or {}

  if FORMAT_LATEX then
    local head_tex = inlines_to('latex', head)
    local badge_tex = extra.badge and ('\\nbbadge{' .. latex_escape(extra.badge) .. '}') or ''
    local body = pandoc.Blocks {}
    if extra.note then body:insert(pandoc.Para(extra.note)) end
    body:extend(div.content)
    local head_raw = pandoc.RawInline('latex', '\\nbhead{' .. head_tex .. badge_tex .. '}')
    local first = body[1]
    if first and (first.t == 'Para' or first.t == 'Plain') then
      local inl = pandoc.Inlines { head_raw }
      inl:extend(first.content)
      body[1] = pandoc.Para(inl)
    else
      body:insert(1, pandoc.Para { head_raw })
    end
    local content = pandoc.Blocks {}
    content:insert(pandoc.RawBlock('latex', string.format('\\begin{nbblock}{%s}{%s}{%s}', style, tag_slug, id)))
    content:extend(body)
    content:insert(pandoc.RawBlock('latex', '\\end{nbblock}'))
    return pandoc.Div(content)
  end

  local classes = { 'nb', 'nb-' .. t, 'nb-style-' .. style }
  local attrs = { ['data-type'] = t }
  if number and number ~= '' then attrs['data-number'] = number end
  if tag_slug ~= '' then
    table.insert(classes, 'nb-tag-' .. tag_slug)
    attrs['data-tag'] = tag_slug
  end
  if extra.ref then attrs['data-ref'] = extra.ref end
  local head_div_content = pandoc.Inlines { pandoc.Span(head, { class = 'nb-name' }) }
  if extra.badge then
    head_div_content:insert(pandoc.Space())
    head_div_content:insert(pandoc.Span({ pandoc.Str(extra.badge) }, { class = 'nb-badge' }))
  end
  local body = pandoc.Blocks {}
  if extra.note then body:insert(pandoc.Para(extra.note)) end
  body:extend(div.content)
  return pandoc.Div({
    pandoc.Div({ pandoc.Plain(head_div_content) }, { class = 'nb-head' }),
    pandoc.Div(body, { class = 'nb-body' }),
  }, pandoc.Attr(id, classes, attrs))
end

local function prefix_first_para(blocks, prefix_inlines)
  local first = blocks[1]
  if first and (first.t == 'Para' or first.t == 'Plain') then
    local inl = pandoc.Inlines {}
    inl:extend(prefix_inlines)
    inl:insert(pandoc.Space())
    inl:extend(first.content)
    blocks[1] = pandoc.Para(inl)
  else
    blocks:insert(1, pandoc.Para(prefix_inlines))
  end
  return blocks
end

local function render_proof_like(div, name)
  local title = div.attributes['title']
  local label = name
  if title and title ~= '' then label = name .. ' ' .. title end
  if FORMAT_LATEX then
    local content = pandoc.Blocks {}
    content:insert(pandoc.RawBlock('latex', '\\begin{nbproof}{' .. inlines_to('latex', md_inlines_resolved(label)) .. '}'))
    content:extend(div.content)
    content:insert(pandoc.RawBlock('latex', '\\end{nbproof}'))
    return pandoc.Div(content)
  end
  local blocks = pandoc.Blocks(div.content)
  local prefix = pandoc.Inlines { pandoc.Emph(md_inlines_resolved(label .. '.')) }
  prefix_first_para(blocks, prefix)
  local cls = has_class(div, 'proof') and 'nb-proof' or 'nb-solution'
  return pandoc.Div(blocks, { class = cls })
end

local function render_answer(div)
  local blocks = pandoc.Blocks(div.content)
  prefix_first_para(blocks, pandoc.Inlines { pandoc.Strong { pandoc.Str('Ответ:') } })
  if FORMAT_LATEX then
    local content = pandoc.Blocks { pandoc.RawBlock('latex', '\\begin{nbanswer}') }
    content:extend(blocks)
    content:insert(pandoc.RawBlock('latex', '\\end{nbanswer}'))
    return pandoc.Div(content)
  end
  return pandoc.Div(blocks, { class = 'nb-answer' })
end

local function render_answers(div)
  if FORMAT_LATEX then
    local content = pandoc.Blocks { pandoc.RawBlock('latex', '\\begin{nbanswers}') }
    content:extend(div.content)
    content:insert(pandoc.RawBlock('latex', '\\end{nbanswers}'))
    return pandoc.Div(content)
  end
  local content = pandoc.Blocks { pandoc.RawBlock('html', '<details class="nb-answers"><summary>Ответы</summary>') }
  content:extend(div.content)
  content:insert(pandoc.RawBlock('html', '</details>'))
  return pandoc.Div(content)
end

-- реестр: блок со ссылкой ref=… берёт номер и заголовок из индекса
local function render_registry_block(div)
  local ref = div.attributes['ref']
  local entry = lookup(ref)
  if not entry then
    err('реестр: неизвестная ссылка ref=' .. ref)
    return div
  end
  local t = block_type(div) or entry.type
  if not BLOCKS[t] then t = entry.type end
  local parts = {}
  local title = div.attributes['title'] or entry.title
  if entry.tag and entry.tag ~= '' then table.insert(parts, entry.tag) end
  if title and title ~= '' then table.insert(parts, title) end
  local note = pandoc.Inlines {}
  local status = div.attributes['status']
  local href = ref_href(entry, false)
  local where = pandoc.Inlines { pandoc.Str('Лекция\u{00A0}' .. int_str(entry.lecture)) }
  if href then
    note:insert(pandoc.Link(where, href, '', { class = 'ref', ['data-ref'] = ref }))
  else
    note:extend(where)
  end
  if status and status ~= '' then
    note:insert(pandoc.Str(';'))
    note:insert(pandoc.Space())
    note:extend(md_inlines(status))
  end
  local extra = { note = pandoc.Inlines { pandoc.Emph(note) }, ref = ref }
  if entry.basis == 'forecast' then extra.badge = 'черновик' end
  div.identifier = 'reg-' .. ref
  div.attributes['tag'] = entry.tag
  return render_box(div, t, entry.number, parts, extra)
end

local function render_course_glossary()
  local course_gl = (S.glossary_index or {})[S.course or ''] or {}
  table.sort(course_gl, function(a, b) return pandoc.text.lower(a.term) < pandoc.text.lower(b.term) end)
  local items = {}
  for _, g in ipairs(course_gl) do
    local term = pandoc.read(g.term_md, 'markdown').blocks
    local term_inl = (term[1] and term[1].content) or pandoc.Inlines { pandoc.Str(g.term) }
    local defs = pandoc.read(g.def_md, 'markdown').blocks
    defs:insert(pandoc.Para { pandoc.Emph { pandoc.Str('Лекция\u{00A0}' .. int_str(g.lecture)) } })
    table.insert(items, { term_inl, { defs } })
  end
  if #items == 0 then return pandoc.Para { pandoc.Emph { pandoc.Str('Глоссарий пока пуст.') } } end
  return pandoc.DefinitionList(items)
end

local function render(doc)
  local c = new_counters()
  local tikz_jobs = {}
  doc = doc:walk {
    traverse = 'topdown',
    Div = function(div)
      if div.attributes['ref'] then
        return render_registry_block(div)
      end
      if has_class(div, 'course-glossary') then
        return pandoc.Div({ render_course_glossary() }, { class = 'nb-course-glossary' })
      end
      local t = block_type(div)
      if t then
        local number = ''
        if is_numbered_div(div) then number = next_number(c, 'block') end
        local parts = header_text({ tag = div.attributes['tag'], title = div.attributes['title'] })
        local tag = div.attributes['tag']
        if tag and tag ~= '' and not TAGS[tag] then
          err('неизвестная пометка замечания: ' .. tag)
        end
        return render_box(div, t, number, parts)
      end
      if has_class(div, 'proof') then return render_proof_like(div, 'Доказательство') end
      if has_class(div, 'solution') then return render_proof_like(div, 'Решение') end
      if has_class(div, 'answer') then return render_answer(div) end
      if has_class(div, 'answers') then return render_answers(div) end
    end,
    CodeBlock = function(cb)
      if not has_class(cb, 'tikz') then return nil end
      local number = next_number(c, 'fig')
      local caption = md_inlines_resolved(cb.attributes['caption'] or '')
      local id = cb.identifier
      if FORMAT_LATEX then
        local cap = inlines_to('latex', caption)
        local anchor = id ~= '' and ('\\hypertarget{' .. id .. '}{}') or ''
        return pandoc.RawBlock('latex',
          '\\begin{nbfigure}' .. anchor .. '\n' .. cb.text .. '\n\\nbfigcaption{' .. number .. '}{' .. cap .. '}\n\\end{nbfigure}')
      end
      local hash = pandoc.sha1(cb.text)
      table.insert(tikz_jobs, { hash = hash, code = cb.text, id = id, number = number })
      local cap_html = inlines_to('html', caption)
      local alt = stringify(caption)
      return pandoc.RawBlock('html', string.format(
        '<figure class="nb-figure"%s data-number="%s"><img src="fig/%s.svg" alt="%s"><figcaption><span class="nb-fig-num">Рис.&nbsp;%s.</span> %s</figcaption></figure>',
        id ~= '' and (' id="' .. id .. '"') or '', number, hash, alt:gsub('"', '&quot;'), number, cap_html))
    end,
    Inlines = function(inlines)
      local out = pandoc.Inlines {}
      local i = 1
      local changed = false
      while i <= #inlines do
        local id, j = eq_label_at(inlines, i)
        if id then
          local number = next_number(c, 'eq')
          local m = inlines[i]
          local math = pandoc.Math('DisplayMath', m.text .. ' \\tag{' .. number .. '}')
          if FORMAT_LATEX then
            out:insert(pandoc.RawInline('latex', '\\hypertarget{' .. id .. '}{}'))
            out:insert(math)
          else
            out:insert(pandoc.Span({ math }, { id = id, class = 'nb-eq', ['data-number'] = number }))
          end
          i = j + 1
          changed = true
        else
          out:insert(inlines[i])
          i = i + 1
        end
      end
      if changed then return out end
    end,
    Cite = function(cite)
      return resolve_cite(cite)
    end,
    DefinitionList = function(dl)
      if not FORMAT_LATEX then return nil end
      -- термин уходит в \item[…]: «]» внутри формулы закрыл бы аргумент
      for _, item in ipairs(dl.content) do
        local term = pandoc.Inlines { pandoc.RawInline('latex', '{') }
        term:extend(item[1])
        term:insert(pandoc.RawInline('latex', '}'))
        item[1] = term
      end
      return dl
    end,
    Table = function(tbl)
      if not FORMAT_LATEX then return nil end
      -- pandoc округляет доли ширины вверх, и сумма > 1 даёт overfull box
      local total = 0
      for _, cs in ipairs(tbl.colspecs) do
        if type(cs[2]) == 'number' then total = total + cs[2] end
      end
      if total > 0.97 then
        for i, cs in ipairs(tbl.colspecs) do
          if type(cs[2]) == 'number' then tbl.colspecs[i] = { cs[1], cs[2] * 0.97 / total } end
        end
        return tbl
      end
    end,
    Header = function(h)
      if FORMAT_HTML and h.level <= 3 then
        table.insert(S.toc, { level = h.level, id = h.identifier, text = stringify(h.content) })
      end
      if FORMAT_LATEX and h.identifier:match('^sec:') then
        -- оставляем как есть: pandoc сам ставит \label/\hypertarget
        return nil
      end
    end,
  }
  S.figures = tikz_jobs
  return doc
end

-- ---------------------------------------------------------------------------
-- метаданные для шаблона
-- ---------------------------------------------------------------------------

local function set_template_meta(doc, config)
  local meta = doc.meta
  local course_cfg = (config.courses or {})[S.course or ''] or {}
  local course_name = course_cfg.name or (S.course or '')
  meta['course_name'] = pandoc.MetaString(course_name)
  meta['program'] = pandoc.MetaString(config.program or '')
  local date = meta_str(meta, 'date')
  meta['date_ru'] = pandoc.MetaString(date_ru(date))
  if S.kind == 'registry' then
    meta['header_line'] = pandoc.MetaString((config.program or '') .. ' · ' .. course_name .. ' · Реестр теории')
  else
    meta['header_line'] = pandoc.MetaString(string.format('%s · %s · Лекция %s · %s',
      config.program or '', course_name, tostring(S.lecture), date_ru(date)))
  end
  if S.basis == 'forecast' then meta['is_forecast'] = pandoc.MetaBool(true) end
  -- pandoc не должен печатать дату/заголовок своими средствами
  meta['notes_title'] = meta['title']
  return doc
end

function Pandoc(doc)
  local meta = doc.meta
  S.mode = meta_str(meta, 'notes_mode') or 'render'
  S.kind = meta_str(meta, 'kind') or 'notes'
  S.course = meta_str(meta, 'course')
  S.lecture = meta_str(meta, 'lecture')
  S.week_id = meta_str(meta, 'week_id')
  S.basis = meta_str(meta, 'basis') or 'lecture'
  S.site_url = meta_str(meta, 'site_url')
  local out_path = meta_str(meta, 'notes_out')
  local config = read_json(meta_str(meta, 'notes_config') or 'templates/courses.json') or {}

  if S.kind == 'registry' then
    S.lecture = '0'
  else
    collect(doc)
  end

  if S.mode == 'index' then
    local labels = {}
    for _, id in ipairs(S.label_order) do
      local e = S.labels[id]
      labels[id] = {
        id = id, type = e.type, name = e.name, number = e.number, title = e.title,
        tag = e.tag ~= '' and e.tag or nil,
      }
    end
    local glossary = collect_glossary(doc)
    if out_path then
      write_json(out_path, {
        course = S.course, lecture = tonumber(S.lecture), week_id = S.week_id,
        basis = S.basis, kind = S.kind,
        title = meta_str(meta, 'title'), date = meta_str(meta, 'date'),
        labels = labels, label_order = S.label_order, glossary = glossary,
      })
    end
    if #errors > 0 then error('notes.lua: ' .. #errors .. ' ошибок') end
    return doc
  end

  -- render
  local index_path = meta_str(meta, 'notes_index')
  local idx = index_path and read_json(index_path) or {}
  S.index = idx.labels or {}
  S.glossary_index = idx.glossary or {}

  doc = render(doc)
  doc = set_template_meta(doc, config)

  if FORMAT_HTML and out_path then
    local labels = {}
    for _, id in ipairs(S.label_order) do
      local e = S.labels[id]
      table.insert(labels, { id = id, type = e.type, name = e.name, number = e.number, title = e.title })
    end
    local glossary = {}
    if S.kind == 'notes' then
      for _, g in ipairs(collect_glossary(doc, 'html')) do table.insert(glossary, g) end
    end
    write_json(out_path, {
      course = S.course, course_name = meta_str(doc.meta, 'course_name'),
      kind = S.kind, lecture = tonumber(S.lecture), week_id = S.week_id,
      title = meta_str(meta, 'title'), date = meta_str(meta, 'date'),
      date_ru = meta_str(doc.meta, 'date_ru'), basis = S.basis,
      based_on = meta_str(meta, 'based_on'), header_line = meta_str(doc.meta, 'header_line'),
      toc = S.toc, labels = labels, figures = S.figures, glossary = glossary,
    })
  end

  if #errors > 0 then
    error('notes.lua: ' .. #errors .. ' ошибок, см. выше')
  end
  return doc
end

return { { Pandoc = Pandoc } }
