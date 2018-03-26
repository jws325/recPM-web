/* jshint esversion: 6 */

import * as d3 from 'd3'
import Grid from '../../assets/js/d3-grid.js'

export default function RPM (target, handler) {
  'use strict'

  var th, gradient

  th = this
  th._data = null
  th._handler = handler
  th._flowerById = {}
  th._nodesById = {}
  th._glowById = {}
  th._levelRadius = 170
  th._proposedRadius = 270
  th._proposedPlaceRadius = 1.5
  th._proposedTextRadius = th._proposedRadius
  th._offset = [0, 0]
  th._withProposed = false
  th._hideProposed = false
  th._drawedFocus = null
  th.focusId = null

  th.itemOptions = {
    task: {
      length: 32,
      shadowRadius: 19,
      height: 4,
      spacing: 50,
      textRadius: 22,
      boundsRadius: 17,
      textOffset: {x: 0, y: -2.5}
    },
    project: {
      shadowRadius: 17,
      length: 21,
      spacing: 80,
      textRadius: 25,
      boundsRadius: 20,
      textOffset: {x: 0, y: -10}
    }
  }

  th.pointerOptions = {
    width: 16,
    height: 21,
    animationOffsetY: -15
  }

  th.textOptions = {
    paddingX: 4,
    paddingY: 0,
    cornerRadius: 3,
    lineHeight: 18
  }

  th.proposedArcOptions = {
    offset: 50,
    thickness: 4
  }

  th.glowOptions = {
    maxRadius: 80,
    numLines: 16,
    lineLength: 12,
    distanceFade: 0.2,
    repeat: 1,
    duration: 1000,
    nodeT: 1.5
  }

  th.size = [1, 1]
  // th.chartRadius = 60
  th.breadcrumb = []
  th.zoom = d3.zoom().on('zoom', function () {
    // var bounds, transform
    // bounds = th.svg.node().getBoundingClientRect()
    th.zoomG.attr('transform', d3.event.transform)
  })

  th.zoom.scaleExtent([0.5, 1.8])

  th.container = d3.select(target).append('div').attr('class', 'rpm-container').style('position', 'relative')
  th.body = th.container.append('div').attr('class', 'rpm-body')
  th.breadcrumbContainer = th.body.append('div').attr('class', 'breadcrumb-container')
  th.svg = th.body.append('svg').attr('class', 'rpm-svg').attr('width', '100%').attr('height', '100%').style('width', '100%').style('height', '100%')

  th.defs = th.svg.append('defs')
  th.defs.append('filter')
    .attr('x', '-50%')
    .attr('y', '-50%')
    .attr('width', '200%')
    .attr('height', '200%')
    .attr('id', 'blur-filter')
    .attr('color-interpolation-filters', 'sRGB')
    .append('feGaussianBlur')
      .attr('stdDeviation', 4)

  th.defs.append('filter')
    .attr('x', '-50%')
    .attr('y', '-50%')
    .attr('width', '200%')
    .attr('height', '200%')
    .attr('id', 'shadow-filter')
    .attr('color-interpolation-filters', 'sRGB')
    .append('feGaussianBlur')
      .attr('stdDeviation', 8)

  th.gradients = [
    {id: 'link-gradient-top', start: {color: '#000', opacity: 0.05}, end: {color: '#000', opacity: 0.2}, x1: '0%', y1: '100%', x2: '0%', y2: '0%'},
    {id: 'link-gradient-bottom', start: {color: '#000', opacity: 0.05}, end: {color: '#000', opacity: 0.2}, x1: '0%', y1: '0%', x2: '0%', y2: '100%'},
    {id: 'link-gradient-left', start: {color: '#000', opacity: 0.05}, end: {color: '#000', opacity: 0.2}, x1: '100%', y1: '0%', x2: '0%', y2: '0%'},
    {id: 'link-gradient-right', start: {color: '#000', opacity: 0.05}, end: {color: '#000', opacity: 0.2}, x1: '0%', y1: '0%', x2: '100%', y2: '0%'},
    {id: 'ellipse-gradient', start: {color: '#000', opacity: 0.08}, end: {color: '#000', opacity: 0.06}, x1: '0%', y1: '0%', x2: '0%', y2: '100%'}
  ]

  gradient = th.defs.selectAll('.gradient').data(th.gradients)
  gradient.enter().append('linearGradient').attr('class', 'gradient')
    .each(function (d) {
      var el = d3.select(this)
      el.attr('id', d.id)
        .attr('x1', d.x1)
        .attr('y1', d.y1)
        .attr('x2', d.x2)
        .attr('y2', d.y2)

      el.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d.start.color)
        .attr('stop-opacity', d.start.opacity)
      el.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d.end.color)
        .attr('stop-opacity', d.end.opacity)
    })

  th.updateArrowHeads()

  th.mainG = th.svg.append('g').attr('class', 'main')
  th.centerSVG = th.mainG.append('svg').attr('class', 'center').attr('x', '50%').attr('y', '50%').style('overflow', 'visible').call(th.zoom)
  th.bgRect = th.centerSVG.append('rect').attr('fill', 'transparent').attr('width', '100%').attr('height', '100%').attr('x', '-50%').attr('y', '-50%')
  th.zoomG = th.centerSVG.append('g').attr('class', 'zoom')
  th.offsetG = th.zoomG.append('g').attr('class', 'offset')
  th.isometric = th.offsetG.append('g').attr('class', 'isometric')
  th.focus = th.offsetG.append('g').attr('class', 'focus')
  th.links = th.offsetG.append('g').attr('class', 'links')
  th.shadows = th.offsetG.append('g').attr('class', 'shadows')
  th.nodes = th.offsetG.append('g').attr('class', 'nodes')
  th.searchSVG = th.svg.append('svg').attr('width', '100%').attr('height', '100%')
  th.searchSVG.append('rect').attr('fill', '#fff').attr('width', '100%').attr('height', '100%').attr('x', '0').attr('y', '0')
  th.searchG = th.searchSVG.append('g')
  th.update()

  window.addEventListener('hashchange', () => { th.updateFromHash() }, false)
}

RPM.prototype.shake = function () {
  var th
  th = this

  th.offsetG.transition().duration(800).ease(d3.easeSinInOut).tween('tween', function () {
    return function (t) {
      th.offsetG.attr('transform', 'translate(' + Math.sin(t * 6 * Math.PI) * 2.5 + ', 0)')
    }
  })
}

RPM.prototype.updateFromHash = function (isInitial) {
  var datum, th, hash, id
  th = this
  hash = window.location.hash.replace(/(^#|\/$)/g, '')
  id = hash.split('/').pop() || th.flower.id
  datum = th.getFlowerById(id)
  if (!datum) {
    if (isInitial) {
      window.alert('The diagram does not contain the node requested in the URL. Will be shown the root node.')
    }
    th.shake()
    datum = th.getFlowerById(th.focusId) || th.getFlowerById(th.activeId) || th.flower
  }

  id = (datum.data.type === 'task' || th.focusId !== datum.id) && datum.parent ? datum.parent.id : datum.id
  th.focusId = datum.id
  th.update(id)
}

RPM.prototype.addItem = function (d) {
  var th, node, key
  th = this
  if (th.currentDatum) {
    let newData, children
    newData = {
      name: th.getNewName((d.proposed ? 'Proposed ' : 'New ') + RPM.capitalize(d.type)),
      id: th.currentDatum.id + (d.proposed ? 'p' : '') + (th.currentDatum.children ? th.currentDatum.children.length : 0) + (new Date()).valueOf(),
      progress: 0,
      importance: 'normal',
      date: '',
      recurring: false,
      notes: '',
      managers: [],
      workers: [],
      dependencies: [],
      people: [],
      attachments: []
    }

    for (key in d) {
      newData[key] = d[key]
    }

    th.addDraft(newData)

    if (th._data) {
      th.currentDatum.data.children = th.currentDatum.data.children || []
      th.currentDatum.data.children.push(newData)

      if (th.currentDatum.data.draft) {
        th.currentDatum.data.draft.children = th.currentDatum.data.draft.children || []
        th.currentDatum.data.draft.children.push(newData)
      }

      th.updateFlower()
      children = th.getFlowerById(th.activeId).children
      node = children[children.length - 1]
      th.updatePath(node.id)
      // th.callHandler('added', node)
      // th.focusId = node.id
      // th.update(th.activeId, 'newItemDraw')
    } else {
      th._data = newData
      th.updateFlower()
      th.updatePath(th.flower.id)
      // th.callHandler('added', th.flower)
      // th.focusId = th.flower.id
      // th.update(null, 'newItemDraw')
    }

    // if (d.proposed) {
    //   th._hideProposed = false
    // }
  }
}

RPM.prototype.removeItem = function (id) {
  var th = this
  th.focusId = null

  if (th._data.id === id) {
    th._data = null
    th.update()
    window.location.hash = ''
    th.callHandler('removed', {data: {data: {draft: null}, empty: true}})
  } else {
    remove(th._data)
  }

  function remove (data) {
    if (data.children) {
      for (var i = 0; i < data.children.length; i++) {
        if (data.children[i].id === id) {
          data.children.splice(i, 1)
          if (data.draft) {
            data.draft.children = data.children.slice()
          }
          th.updatePath(data.id)
          th.callHandler('removed', {data: data})
        } else {
          remove(data.children[i])
        }
      }
    }
  }
}

RPM.prototype.addDraft = function (d) {
  var draft, key
  draft = {}

  for (key in d) {
    if (key !== 'draft') {
      draft[key] = cloneArray(d[key])
    }
  }

  d.draft = draft

  function cloneArray (value) {
    if (!Array.isArray(value)) {
      return value
    }

    var newArr = []
    for (var i = 0; i < value.length; i++) {
      newArr.push(value[i])
    }

    return newArr
  }
}

RPM.prototype.getNewName = function (startName) {
  var th, testRegExp, newItems
  th = this
  testRegExp = new RegExp(startName + '[\\s]*[\\d]*$')
  newItems = th.flower.descendants().filter(function (d) {
    return testRegExp.test(d.data.name)
  })

  return startName + (newItems.length ? (' ' + newItems.length) : '')
}

RPM.prototype.refreshView = function () {
  this.update(this.activeId, 'refresh')
}

RPM.prototype.callHandler = function (type, data) {
  if (this._handler) {
    this._handler({type: type, data: data})
  }
}

RPM.prototype.showProposed = function (value) {
  this._hideProposed = !value
  this.refreshView()
  return !this._hideProposed
}

RPM.prototype.showCompleted = function (value) {
  var hideFocused
  hideFocused = !value && this.getFocusedDatum().data.status === 'completed' && !this.getFocusedDatum().data.recurring
  this._showCompleted = value

  if (hideFocused) {
    this.focusId = this.activeId
  }

  this.update(this.activeId, hideFocused ? null : 'refresh')
  return this._showCompleted
}

RPM.prototype.update = function (id, eventType) {
  var th,
    bounds

  th = this
  if (!th._data) {
    th.shadows.selectAll('*').transition().style('opacity', 0).remove()
    th.links.selectAll('*').transition().style('opacity', 0).remove()
    th.nodes.selectAll('*').transition().style('opacity', 0).remove()
    th.isometric.selectAll('*').transition().style('opacity', 0).remove()
    th.breadcrumbContainer.selectAll('*').transition().style('opacity', 0).remove()
    th.breadcrumb = []
    return
  }

  bounds = th.container.node().getBoundingClientRect()
  th.size = [bounds.width, bounds.height]

  th.updateFlower()

  if (th._searchString) {
    th.breadcrumbContainer.transition().style('opacity', 0)
    th.svg.append(() => { return th.searchSVG.node() })
    th.drawSearch()
  } else {
    th.breadcrumbContainer.transition().style('opacity', 1)
    th.searchSVG.transition().style('opacity', 0).remove()
    if (typeof id !== 'undefined') {
      th.drawNode(th.getFlowerById(id) || th.flower, eventType)
    } else {
      th.drawNode(th.flower, eventType)
    }
  }
}

RPM.prototype.focus = function (id) {
  this.focusId = id
}

RPM.prototype.offset = function (value) {
  if (typeof value !== 'undefined') {
    this._offset = value
    this.offsetG.transition().duration(500).attr('transform', 'translate(' + [value[0], value[1]] + ')')
  }

  return this._offset
}

RPM.prototype.search = function (value) {
  if (this._searchString === value) {
    return
  }

  this._searchString = value
  this.update(this.activeId)
}

RPM.prototype.data = function (value) {
  if (value) {
    this._data = value
    this.updateFlower()
    this.updateFromHash(true)
  }
  return this._data
}

RPM.prototype.drawSearch = function () {
  if (!this._data) {
    return
  }

  var testRegExp, filtered, th, bandsGrid, nodes, newNodes, nodeSize, tAdd, descendants

  th = this
  tAdd = d3.transition()

  filtered = []
  th.searchSVG.attr('viewBox', '0 0 ' + th.size[0] + ' ' + th.size[1]).style('display', 'block').transition(tAdd).style('opacity', 1)

  testRegExp = new RegExp(th._searchString, 'i')
  descendants = th.flower.descendants().sort(function (a, b) {
    return a.data.name.toLowerCase().localeCompare(b.data.name.toLowerCase())
  })

  descendants.forEach((d) => {
    if (testRegExp.test(d.data.name)) {
      filtered.push({data: d.data})
    }
  })

  bandsGrid = Grid()
    .bands()
    .size([th.size[0], th.size[1]])
    .padding(10)

  nodeSize = bandsGrid.nodeSize()
  nodes = th.searchG.selectAll('.node').data(bandsGrid(filtered), function (d) { return d.data.id })
  newNodes = nodes.enter().append('g').attr('class', 'node').each(function (d) {
    var el
    el = d3.select(this)
    el.attr('transform', translate)
    th.addNodeAttributes(el, d, d.data)

    el.append('text')
      .attr('class', 'item-name')
      .attr('text-anchor', 'middle')
      .attr('y', 30)
      .text(d.data.name)

    th.updateNode(el, d.data, 0, d)
  }).on('click', function (d) {
    th._searchString = ''
    th.updatePath(d.data.id)
  })

  nodes.merge(newNodes).each(function (d) {
    var el
    el = d3.select(this)
    el.attr('transform', translate)
    th.addNodeAttributes(el, d, d.data)

    el.transition(tAdd).attrTween('item', function () {
      return function (t) {
        th.updateNode(el, d.data, d3.interpolateNumber(el.node()._t, 1)(t), d)
      }
    })
  })

  nodes.exit().remove()

  function translate (d) {
    return 'translate(' + [d.x + nodeSize[0] / 2, d.y + nodeSize[1] / 2] + ')'
  }
}

RPM.prototype.updatePath = function (id) {
  window.location.hash = this.getBreadcrumb(this._flowerById[id]).map(v => v.id).join('/')
}

RPM.prototype.getFocusedDatum = function () {
  return this._flowerById[this.focusId]
}

RPM.prototype.drawNode = function (node, eventType) {
  var nodes,
    newNodes,
    th,
    tAdd,
    tCenter,
    tLevel,
    levelHeight,
    nodesData,
    depthChange,
    links,
    newLinks

  th = this
  th.updateBreadcrumb(node)
  th.activeId = node.id
  depthChange = th.currentDatum ? th.currentDatum.depth - node.depth : 0
  th.currentDatum = node
  levelHeight = 30

  tAdd = d3.transition()
    .duration(800)

  tLevel = d3.transition()
    .duration(700)

  tCenter = d3.transition()
    .delay(250)
    .ease(d3.easeExpIn)
    .duration(800)

  if (th.focusId === null) {
    th.focusId = node.id
  }

  centerNode(node)
  nodesData = th._data ? [node].concat(node.children || []) : []
  // th.offsetG.transition(tLevel).attr('transform', 'translate(0, ' + (-node.depth * levelHeight - levelHeight) + ')')

  nodes = th.nodes.selectAll('.node').data(nodesData, function (d) { return d.id })
  newNodes = nodes.enter().append('g')
  newNodes
    .style('opacity', 0)
    .each(function (d, i) {
      var el, data

      el = d3.select(this)
      data = (th.focusId === d.id || th.activeId === d.id) ? (d.data.draft || d.data) : d.data
      th.addNodeAttributes(el, d, data)
      th.updateNode(el, data, 0, d)
      el.append('g').attr('class', 'node-text').append('g').attr('class', 'lines-g').append('path')
      el.attr('transform', 'translate(' + d.x + ', ' + (d.y - depthChange * levelHeight) + ')')
      th.updateText(el, d, data)
      th.updateTextPosition(el, data, (d.id === th.activeId) ? Math.PI : d.angle)
    })
    .on('click', function (d, i) {
      var node
      node = (d.id === th.activeId) ? (d.parent || d) : d

      if ((node.id === th.focusId || d.id === th.activeId) && d.parent && d.data.type !== 'task') {
        th.focusId = d.id
        th.drawNode(node)
      } else {
        th.updatePath(node.id)
      }
    })

  newNodes.merge(nodes).each(function (d, i) {
    if (!this._completed) {
      var el, data, useDraft

      el = d3.select(this)
      th._nodesById[d.id] = this
      useDraft = (th.focusId === d.id) && d.data.draft
      data = useDraft ? d.data.draft : d.data
      th.addNodeAttributes(el, d, data)
      th.updateText(el, d, data, useDraft)
      el.classed('draft', useDraft)
      el.attr('data-focus', d.id === th.focusId ? 'true' : null)

      el.select('.item-container')
        .transition(tAdd)
        .tween('item', function () {
          return function (t) {
            let grow, iGrow
            grow = d.id === th.activeId ? 2 : 1
            iGrow = d3.interpolateNumber(el.node()._t, grow)(t)
            th.updateNode(el, data, iGrow, d, iGrow - 1)
            th.updateTextPosition(el, data, d3.interpolateNumber(el.node()._textAngle, (d.id === th.activeId) ? getClosestAngle(el.node()._textAngle) : d.angle)(t))
          }
        })

      el.transition(tLevel)
        .style('opacity', 1)
        .attr('transform', translate)

      el.select('.item-name').text(data.name)
    }
  })

  function getClosestAngle (from) {
    var possibleAngles, min
    min = {value: Math.PI, distance: Infinity}
    possibleAngles = [Math.PI / 2, Math.PI, Math.PI * 1.5]

    for (let i = 0; i < possibleAngles.length; i++) {
      if (min.distance > Math.abs(from - possibleAngles[i])) {
        min.distance = Math.abs(from - possibleAngles[i])
        min.value = possibleAngles[i]
      }
    }

    return min.value
  }

  // dependLinks = th.links.selectAll('.d-link').data(RPM.getLinks(node), function (d) { return d.target.id })

  links = th.links.selectAll('.link').data(th.getDLinks(node), function (d) { return d.source.id + '-' + d.target.id })

  newLinks = links.enter().append('line')

  newLinks.attr('class', 'link')
    .each(function (d) {
      d3.select(this)
      .attr('x1', d.cropped[0].x)
      .attr('y1', d.cropped[0].y)
      .attr('x2', d.cropped[0].x)
      .attr('y2', d.cropped[0].y)
      .style('opacity', 0)
      .attr('marker-end', 'url(#arrowhead-link)')
    })

  links.merge(newLinks).each(function (d) {
    var gradientName

    if (Math.floor(d.cropped[0].x) === Math.floor(d.cropped[1].x)) {
      gradientName = d.cropped[0].y > d.cropped[1].y ? 'link-gradient-top' : 'link-gradient-bottom'
    } else if (Math.floor(d.cropped[0].y) === Math.floor(d.cropped[1].y)) {
      gradientName = d.cropped[0].x > d.cropped[1].x ? 'link-gradient-left' : 'link-gradient-right'
    } else {
      gradientName = d.cropped[0].x > d.cropped[1].x ? 'link-gradient-left' : 'link-gradient-right'
    }
    if (!th._nodesById[d.target.id]._completed && !th._nodesById[d.source.id]._completed) {
      d3.select(this)
      .attr('data-source', d.source.id)
      .attr('data-target', d.target.id)
      .transition(tLevel)
        .attr('x1', function (d) { return d.cropped[0].x })
        .attr('y1', function (d) { return d.cropped[0].y })
        .attr('x2', function (d) { return d.cropped[1].x })
        .attr('y2', function (d) { return d.cropped[1].y })
        .attr('stroke', 'url(#' + gradientName + ')')
        .style('opacity', 1)
    }
  })

  var arc = d3.arc()
  var proposedArcPath = th.isometric.selectAll('.proposed-arc').data((!th._hideProposed && node.proposedChildren && node.proposedChildren.length ? [node] : []), function (d) { return d.id })
  var enterArc = proposedArcPath.enter().append('g').attr('class', 'proposed-arc')
  enterArc.append('path').each(function (d) {
    this._startAngle = d.proposedAngle.min + (d.proposedAngle.max - d.proposedAngle.min) / 2
    this._endAngle = d.proposedAngle.min + (d.proposedAngle.max - d.proposedAngle.min) / 2
    this._radius = d.mainRadius - th.proposedArcOptions.offset
  })

  enterArc.merge(proposedArcPath).each(function (d) {
    var el, path, pathNode
    el = d3.select(this)
    el.attr('transform', 'translate(' + node.x + ',' + node.y + ') scale(1, ' + RPM.yScale + ')')
    path = el.select('path')
    pathNode = path.node()
    path.transition(tAdd).tween('item', function () {
      return function (t) {
        let radius, startAngle, endAngle, padAngle
        padAngle = Math.PI * 2 / node.children.length / 2
        radius = d3.interpolateNumber(pathNode._radius, d.mainRadius - th.proposedArcOptions.offset)(t)
        startAngle = d3.interpolateNumber(pathNode._startAngle, d.proposedAngle.min - padAngle)(t)
        endAngle = d3.interpolateNumber(pathNode._endAngle, d.proposedAngle.max + padAngle)(t)
        path.attr('d', arc({
          outerRadius: radius,
          innerRadius: radius - th.proposedArcOptions.thickness,
          startAngle: startAngle,
          endAngle: endAngle,
          cornerRadius: th.proposedArcOptions.thickness / 2
        }))
        pathNode._radius = radius
        pathNode._startAngle = startAngle
        pathNode._endAngle = endAngle
      }
    })
  })

  proposedArcPath.exit().transition(tLevel).style('opacity', 0).remove()

  links.exit().transition(tLevel)
    .style('opacity', 0)
    .remove()

  function translate (d) {
    return 'translate(' + [d.x, d.y] + ')'
  }

  function centerNode (d) {
    var t = d3.zoomTransform(th.centerSVG.node())
    var newT = d3.zoomIdentity.translate(-d.x * t.k, -d.y * t.k).scale(t.k)
    th.zoom.transform(th.centerSVG.transition(tCenter), newT)
  }

  nodes.exit().transition(tLevel)
    .attr('transform', function (d) { return 'translate(' + d.x + ', ' + (d.y + depthChange * levelHeight) + ')' })
    .style('opacity', 0).remove()

  th.callHandler(eventType || 'draw', node)
  th.callHandler('changedParental', node)

  if (th._drawedFocus !== th.focusId) {
    th.callHandler('select', th.getFocusedDatum())
    th._drawedFocus = th.focusId
  }
}

RPM.prototype.prepareItemToComplete = function (id, value) {
  // var th, node, el, transition, shadow, reflection, interpolatedT, valueT, startT, startY, itemEl
  // th = this
  // node = th._nodesById[id]
  // el = d3.select(node)
  // shadow = el.select('.shadow')
  // reflection = el.select('.reflection-g')
  // transition = d3.transition().duration(800)
  // itemEl = el.select('.item')
  // itemEl.transition(transition).tween('prepareItemToComplete', function () {
  //   startT = node._t || 0
  //   startY = node._itemY || 0
  //   return function (t) {
  //     interpolatedT = d3.interpolateNumber(startT, value ? th.glowOptions.nodeT : 1)(t)
  //     valueT = value ? t : 1 - t
  //     th.updateNode(el, node._data, interpolatedT, el.datum())
  //     node._itemY = d3.interpolateNumber(startY, value ? -7 : 0)(t)
  //     itemEl.attr('transform', 'translate(0, ' + node._itemY + ')')
  //     th.updateTextPosition(el, node._data, node._textAngle)
  //     shadow.style('opacity', valueT * 0.2)
  //     reflection.style('opacity', 1 - valueT)
  //   }
  // })

  d3.select(this._nodesById[id]).classed('completed', value)
}

RPM.prototype.completeItem = function (id) {
  var th, node, el, itemEl, startGlowT, datum
  th = this
  node = th._nodesById[id]
  node._completed = true
  el = d3.select(node)
  datum = el.datum()
  itemEl = el.select('.item')

  if (this._showCompleted) {
    finishComplete()
    return
  }

  node._glowTransition = node._glowTransition || {}
  th.links.selectAll('.link[data-target=' + id + ']').each(function (d) {
    d3.select(this).transition().ease(d3.easeQuadOut).duration(400)
      .style('opacity', 0)
  })
  d3.select(node._glowTransition)
  .transition().ease(d3.easePoly).duration(th.glowOptions.duration).tween('tween', function () {
    startGlowT = node._glowT || 0
    return function (t) {
      node._glowT = d3.interpolateNumber(startGlowT, 1)(t)
      th.updateGlow(datum, node._glowT)
    }
  }).on('end', finishComplete)

  function finishComplete () {
    node._glowT = 0
    node._completed = false
    itemEl.transition().attr('transform', 'scale(1, 1)')

    th.focusId = th._showCompleted || datum.data.recurring ? id : null

    if (datum.data.recurring) {
      datum.data.progress = 0
      datum.data.status = ''
    } else {
      // th.removeItem(id)
      // datum.data.completed = true
      datum.data.status = 'completed'
    }
    th.update(th.activeId, datum.data.recurring || th._showCompleted ? 'endOfCompleteNode' : null)
  }
}

RPM.prototype.updateGlow = function (datum, t) {
  var th
  th = this
  th._glowById[datum.id] = th._glowById[datum.id] || th.isometric.append('g').attr('class', 'glow')
  th._glowById[datum.id]
    .attr('data-importance', datum.data.importance)
    .attr('transform', 'translate(' + [datum.x, datum.y] + ') scale(1, ' + RPM.yScale + ')')
  th.updateGlowLines(th._glowById[datum.id], t)
}

RPM.prototype.updateGlowLines = function (glowNode, t) {
  var th, lines, repeatT
  th = this
  repeatT = t % (1 / th.glowOptions.repeat) / (1 / th.glowOptions.repeat)
  repeatT = t
  glowNode.style('opacity', 1 - repeatT)
  lines = glowNode.selectAll('.glow-line').data(RPM.filledArray(th.glowOptions.numLines))
  lines.enter().append('line').attr('class', 'glow-line')
  .merge(lines).each(function (d, i) {
    var el, coord1, coord2, angle
    angle = i / th.glowOptions.numLines * Math.PI * 2
    el = d3.select(this)
    coord1 = RPM.rotZ(0, th.glowOptions.maxRadius * repeatT, angle)
    coord2 = RPM.rotZ(0, Math.min(th.glowOptions.maxRadius, th.glowOptions.maxRadius * repeatT + th.glowOptions.lineLength), angle)
    el.attr('x1', coord1.x)
      .attr('y1', coord1.y)
      .attr('x2', coord2.x)
      .attr('y2', coord2.y)
      .style('opacity', (1 - th.glowOptions.distanceFade) + ((th.glowOptions.maxRadius + coord1.y) / (th.glowOptions.maxRadius * 2)) * th.glowOptions.distanceFade)
  })

  lines.exit().remove()
}

RPM.prototype.setFocus = function (id) {
  var th

  th = this

  if (th.focusId === id) {
    return
  }

  // transition = d3.transition()
    // .duration(400)
  // updateItem(th.focusId, false)
  // updateItem(id, true)
  d3.select(th._nodesById[th.focusId]).attr('data-focus', null)
  d3.select(th._nodesById[id]).attr('data-focus', 'true')
  th.focusId = id

  // function updateItem (id, focus) {
  //   var node, pointer, target
  //   node = d3.select(th._nodesById[id])
  //   node.classed('focus', focus)
  //   target = node.select('.focus-pointer')

  //   pointer = target.selectAll('.pointer').data(focus ? [node.datum()] : [], function (d) { return d.id })
  //   pointer.enter().append('g')
  //     .attr('class', 'pointer')
  //     .attr('transform', 'translate(0, ' + th.pointerOptions.animationOffsetY + ')')
  //     .each(function () {
  //       d3.select(this).append('path')
  //         .attr('d', ['M0,0', 'L', -th.pointerOptions.width / 2, -th.pointerOptions.height, 'L', th.pointerOptions.width / 2, -th.pointerOptions.height, 'z'].join(' '))
  //     })
  //     .style('opacity', 0)
  //   .merge(pointer).each(function (d) {
  //     d3.select(this).transition(transition)
  //       .attr('transform', 'translate(0, 0)')
  //       .style('opacity', 1)
  //   })

  //   pointer.exit().transition(transition)
  //     .attr('transform', 'translate(0, ' + th.pointerOptions.animationOffsetY + ')')
  //     .style('opacity', 0)
  //     .remove()
  // }
}

RPM.prototype.addNodeAttributes = function (node, d, data) {
  node.attr('class', 'node ' + data.type + '-node')
  node.attr('data-status', String(data.status))
  node.attr('data-assigned', (data.type === 'task' && data.workers && data.workers.length) ? 'true' : null)
  node.attr('data-importance', String(data.importance))
  node.attr('data-empty', String(!d.data.children || !d.data.children.length))
  node.attr('data-recurring', data.recurring ? 'true' : null)
  node.attr('data-active', data.id === this.activeId ? 'true' : null)
  node.classed('proposed', data.proposed)
  node.classed('completed', data.status === 'completed' || data.progress >= 1)
}

RPM.getLinks = function (node) {
  if (node.children) {
    let links = []
    for (var i = 0; i < node.children.length; i++) {
      links.push({'source': node, 'target': node.children[i]})
    }
    return links
  }
  return []
}

RPM.prototype.updateBreadcrumb = function (newItem) {
  var th, items, newItems
  th = this

  this.breadcrumb = this.getBreadcrumb(newItem)

  items = th.breadcrumbContainer.selectAll('.breadcrumb-item').data(th.breadcrumb)
  newItems = items.enter().append('div').attr('class', 'breadcrumb-item')

  newItems.on('click', function (d) {
    th.drawNode(th.getFlowerById(d.id) || th.flower)
  })
  .style('opacity', 0)
  .transition()
  .style('opacity', 1)

  newItems.merge(items).text(function (d) { return d.data.name })
  items.exit().transition()
    .style('opacity', 0).remove()
}

RPM.prototype.getBreadcrumb = function (datum) {
  datum = datum || this.getFocusedDatum()
  var res = [datum]
  while (datum.parent) {
    res.unshift(datum = datum.parent)
  }
  return res
}

RPM.prototype.updateText = function (node, d, data, isDraft) {
  var textG, textData, textNodes, enterNodes, th, linesData, pathData, isBottomNode, angle, yOffset, draftNode, linesG, tGeneral

  th = this
  linesData = []
  textG = node.select('.node-text')
  linesG = node.select('.lines-g')
  pathData = []
  angle = (node.node()._textAngle || 0) % 360
  isBottomNode = (angle > Math.PI / 2) && (angle < Math.PI * 1.5)
  yOffset = (isDraft && isBottomNode) ? th.textOptions.lineHeight : 0
  tGeneral = d3.transition().duration(500)

  textData = [{text: data.name}]

  // if (isDraft) {
  //   textData.unshift({text: 'Draft', noBg: true, yOffset: 0})
  // }

  if (data.type === 'project') {
    textData.push({text: Math.round(d.descendantsProgress * 100) + '%'})
  }

  // if (data.status === 'completed') {
  //   textData.push({text: 'completed'})
  // }
  // } else {
  //   textData.push({text: Math.round(data.progress * 100) + '%'})
  // }

  draftNode = textG.selectAll('.draft-line').data(isDraft ? [{}] : [])
  draftNode.enter().insert('text', ':first-child').attr('class', 'draft-line').style('opacity', 0).attr('transform', 'translate(0, 0)').merge(draftNode)
    .text('Draft')
    .attr('text-anchor', 'middle')
    .transition(tGeneral)
    .attr('transform', 'translate(0, ' + (isBottomNode ? 0 : -th.textOptions.lineHeight) + ')')
    .style('opacity', 1)

  draftNode.exit().transition(tGeneral).tween('textG', function () {
    return function (t) {
      th.updateTextPosition(node, data, node.node()._textAngle || 0)
    }
  }).attr('transform', 'translate(0, 0)').style('opacity', 0).remove()

  textNodes = linesG.selectAll('.text-line').data(textData)
  enterNodes = textNodes.enter().append('g').attr('class', 'text-line').each(function () {
    d3.select(this).append('text')
  })

  linesG.transition(tGeneral).tween('textG', function () {
    var el, startYOffset
    el = d3.select(this)
    startYOffset = el.node()._yOffset || 0
    return function (t) {
      el.attr('transform', 'translate(0, ' + (yOffset * t) + ')')
      el.node()._yOffset = d3.interpolateNumber(startYOffset, yOffset)(t)
      el.attr('transform', 'translate(0, ' + (el.node()._yOffset) + ')')
      th.updateTextPosition(node, data, node.node()._textAngle || 0)
    }
  })

  enterNodes.merge(textNodes).each(function (d, i) {
    var el, text, box
    el = d3.select(this)

    text = el.select('text').text(d.text)
      .attr('text-anchor', 'middle')
      .attr('y', i * th.textOptions.lineHeight)

    box = text.node().getBBox()
    box.x -= th.textOptions.paddingX
    box.y -= th.textOptions.paddingY
    box.width += th.textOptions.paddingX * 2
    box.height += th.textOptions.paddingY * 2
    linesData.push({box: box, d: d})
  })

  enterNodes.merge(textNodes).each(function (d, i) {
    if (!linesData[i].d.noBg) {
      var corners, x, y, w, h
      corners = [
        th.textOptions.cornerRadius,
        th.textOptions.cornerRadius,
        th.textOptions.cornerRadius,
        th.textOptions.cornerRadius
      ]

      x = linesData[i].box.x
      y = linesData[i].box.y
      w = linesData[i].box.width
      h = linesData[i].box.height

      if (i > 0 && !linesData[i - 1].d.noBg) {
        if (linesData[i].box.width < linesData[i - 1].box.width) {
          corners[0] = 0
          corners[3] = 0
        } else {
          corners[0] = corners[3] = Math.min(th.textOptions.cornerRadius, Math.abs(linesData[i].box.width - linesData[i - 1].box.width))
        }
        let newY = linesData[i - 1].box.y + (linesData[i].box.y + linesData[i].box.height - linesData[i - 1].box.y) / 2 - 1
        h -= newY - y
        y = newY
      }

      if (i < (linesData.length - 1) && !linesData[i + 1].d.noBg) {
        if (linesData[i].box.width < linesData[i + 1].box.width) {
          corners[1] = 0
          corners[2] = 0
        } else {
          corners[1] = corners[2] = Math.min(th.textOptions.cornerRadius, Math.abs(linesData[i].box.width - linesData[i + 1].box.width) / 2)
        }

        h = (linesData[i + 1].box.y + linesData[i + 1].box.height - y) / 2
      }
      pathData.push(RPM.getRoundedRectData(x, y, w, h, corners))
    }
  })

  textG.select('path').attr('d', pathData.join(' '))
  textNodes.exit().remove()
  th.updateTextPosition(node, data, node.node()._textAngle || 0)
}

RPM.prototype.updateTextPosition = function (node, data, angle) {
  var text, radius, coord, box, offsetScale, nodeCenter, cornerCompensation, nodeBox

  // th = this
  node.node()._textAngle = angle
  text = node.select('.node-text')
  box = text.node().getBBox()
  nodeBox = node.select('.item-container').node().getBBox()
  // radius = th.itemOptions[data.type].textRadius
  radius = nodeBox.width / 2 + 5
  // nodeCenter = th.itemOptions[data.type].textOffset
  nodeCenter = {x: nodeBox.x + nodeBox.width / 2, y: nodeBox.y + nodeBox.height / 2}
  coord = RPM.rotZ(0, -radius, angle)

  offsetScale = {x: coord.x / radius, y: coord.y / radius}
  // offsetScale = {
  //   x: coord.x > 0 ? 1 : -1,
  //   y: coord.y > 0 ? 1 : -1
  // }
  coord.y *= nodeBox.height / nodeBox.width
  cornerCompensation = {
    x: Math.sin((1 - offsetScale.x) * Math.PI) * (box.width / 2 * 0.3),
    y: Math.sin((1 - offsetScale.y) * Math.PI) * (box.height / 2 * 0.3)
  }

  // cornerCompensation.x = 0
  // cornerCompensation.y = 0

  text.attr('transform', 'translate(' + [
    coord.x + box.width / 2 * offsetScale.x - box.x - box.width / 2 + nodeCenter.x + cornerCompensation.x,
    coord.y + box.height / 2 * offsetScale.y - box.y - box.height / 2 + nodeCenter.y + cornerCompensation.y
  ] + ')')

  // text.attr('transform', 'translate(' + [
  //   coord.x,
  //   coord.y
  // ] + ')')

  // text.append('circle').attr('r', 3)
}

RPM.prototype.updateNode = function (node, data, t, d, bottomT) {
  var th, item

  th = this
  item = node.select('.item')

  if (item.node()) {
    if (item.node()._type !== data.type) {
      item.remove()
    }
  } else {
    th.addShadow(node, data)
    item = th.createItem(node.append('g').attr('class', 'item-container'), data, d)
    item.node()._type = data.type
  }

  node.node()._data = data

  // if (node.node()._t !== t) {
  node.node()._t = t
  if (data.type === 'project') {
    th.updateProjectItem(node, data, t, bottomT)
  } else if (data.type === 'task') {
    th.updateTaskItem(node, data, t, bottomT)
  }
  // }
}

RPM.prototype.createItem = function (target, data, d) {
  if (data.type === 'project') {
    return this.createProjectItem(target, data, d)
  } else if (data.type === 'task') {
    return this.createTaskItem(target, data, d)
  }
}

RPM.prototype.addShadow = function (node, data) {
  var th, g

  th = this
  g = node.append('g')
    .attr('class', 'item-effect ' + data.type + '-effect')

  g.append('g')
    .attr('class', 'reflection-g')
    .attr('filter', 'url(#blur-filter)')
    .append('ellipse')
      .attr('rx', th.itemOptions[data.type].shadowRadius)
      .attr('ry', th.itemOptions[data.type].shadowRadius * RPM.yScale)
      .attr('class', 'reflection')

  g.append('g')
    .attr('class', 'shadow-g')
    .attr('filter', 'url(#shadow-filter)')
    .append('ellipse')
      .attr('rx', th.itemOptions[data.type].shadowRadius)
      .attr('ry', th.itemOptions[data.type].shadowRadius * RPM.yScale)
      .attr('class', 'shadow')

  return node
}

RPM.prototype.createProjectItem = function (target, data, d) {
  var g

  g = target.append('g').attr('class', 'item project-item')
  g.append('path').attr('class', 'project-progress')
  g.append('path').attr('class', 'project-fill')
  g.append('path').attr('class', 'project-cap')
  g.append('line').attr('class', 'project-center-line')
  g.append('g').attr('class', 'direction-g')
    .attr('visibility', d.parent ? 'visible' : 'hidden')
    .append('path')
    .attr('class', 'direction')
    .attr('d', 'M0,8A8,8,0,0,1-8,0,8,8,0,0,1,0-8,8,8,0,0,1,8,0,8,8,0,0,1,0,8ZM3.734-1.9a1.036,1.036,0,0,0-1.465,0L0,0.368-2.263-1.9a1.036,1.036,0,0,0-1.465,0,1.036,1.036,0,0,0,0,1.465l3,3a1.036,1.036,0,0,0,1.465,0l3-3A1.036,1.036,0,0,0,3.734-1.9Z')
  return g
}

RPM.prototype.createTaskItem = function (target, data) {
  var g, iconG, recurringG

  g = target.append('g').attr('class', 'item task-item')
  g.attr('data-recurring', data.recurring ? 'true' : null)
  g.append('path').attr('class', 'task-body')
  g.append('path').attr('class', 'task-progress')
  g.append('ellipse').attr('class', 'task-cap').attr('stroke-width', 0)
  iconG = g.append('g').attr('class', 'icon-g').attr('transform', 'scale(1, ' + RPM.yScale + ')')
  iconG.append('path').attr('class', 'icon task-check-icon')
  recurringG = iconG.append('g').attr('class', 'icon task-recurring-icon')
  recurringG.append('path')
  recurringG.append('path').attr('class', 'icon-arrow')
  return g
}

RPM.prototype.updateTaskItem = function (node, data, t) {
  var radius, height, th, checkIcon, recurringIcon, recurringIconScale, checkIconScale, g, endPoint, arrowSize, recurringEndAngle, progressD, progressRotation

  th = this
  radius = th.itemOptions.task.length / 2
  height = th.itemOptions.task.height
  checkIconScale = 0.45
  recurringIconScale = 0.6
  arrowSize = [4, 4]
  recurringEndAngle = Math.PI * 1.65
  progressD = []

  node.select('.task-cap')
    .attr('rx', radius * RPM.xScale)
    .attr('ry', radius * RPM.yScale)
    .attr('cy', -height * t)

  progressRotation = RPM.rotZ(radius, 0, Math.min(Math.PI, data.progress * Math.PI * 2))

  progressD = ['M', 0, -height * t,
    'L', radius * RPM.xScale, -height * t,
    'L', radius * RPM.xScale, 0,
    'A', radius * RPM.xScale, radius * RPM.yScale,
    0, 0, 1,
    progressRotation.x * RPM.xScale, progressRotation.y * RPM.yScale,
    'L', progressRotation.x * RPM.xScale, progressRotation.y * RPM.yScale - height * t]

  if (data.progress > 0.5) {
    progressRotation = RPM.rotZ(radius, 0, data.progress * Math.PI * 2)
    progressD.push(
      'A', radius * RPM.xScale, radius * RPM.yScale,
      0, 0, 1,
      progressRotation.x * RPM.xScale, progressRotation.y * RPM.yScale - height * t
    )
  }

  progressD.push('z')

  node.select('.task-progress').attr('d', progressD.join(' '))

  node.select('.task-body')
    .attr('d', ['M', -radius * RPM.xScale, -height * t,
      'L', -radius * RPM.xScale, 0,
      'A', radius * RPM.xScale, radius * RPM.yScale,
      0, 1, 0,
      radius * RPM.xScale, 0,
      'L', radius * RPM.xScale, -height * t,
      'A', radius * RPM.xScale, radius * RPM.yScale,
      0, 1, 1,
      -radius * RPM.xScale, -height * t,
      'M', -radius * RPM.xScale, 0,
      'A', radius * RPM.xScale, Math.max(0.1, radius * RPM.yScale - (height * t) / 2),
      0, 1, 0,
      radius * RPM.xScale, 0,
      'A', radius * RPM.xScale, radius * RPM.yScale,
      0, 1, 0,
      -radius * RPM.xScale, 0,
      'z'].join(' '))

  node.select('.icon-g').attr('transform', 'translate(' + [0, -height * t] + ') scale(1, ' + RPM.yScale + ')')

  g = node.select('.task-recurring-icon')

  endPoint = RPM.rotZ(0, -radius, recurringEndAngle)

  recurringIcon = g.select('path')
  .attr('d', ['M', 0, (-radius * RPM.yScale * recurringIconScale),
    'A', radius * recurringIconScale * RPM.xScale, radius * recurringIconScale * RPM.yScale,
    0, 1, 1,
    endPoint.x * recurringIconScale * RPM.xScale, endPoint.y * recurringIconScale * RPM.yScale].join(' '))

  recurringIcon.style('stroke-dasharray', recurringIcon.node().getTotalLength())
    .style('stroke-dashoffset', recurringIcon.node().getTotalLength())

  checkIcon = node.select('.task-check-icon')
  .attr('marker-end', 'none')
  .attr('d', ['M', -radius * 0.85 * checkIconScale, (-radius * 0.25 * checkIconScale),
    'L', -radius * 0.6 * checkIconScale, (radius * 0.55 * checkIconScale),
    radius * 0.9 * checkIconScale, (-radius * 0.5 * checkIconScale)].join(' '))

  checkIcon.style('stroke-dasharray', checkIcon.node().getTotalLength())
    .style('stroke-dashoffset', checkIcon.node().getTotalLength())

  node.select('.icon-arrow').attr('d', ['M',
    0, -arrowSize[1] / 2 - radius * recurringIconScale,
    'L', arrowSize[0], -radius * recurringIconScale,
    0, arrowSize[1] / 2 - radius * recurringIconScale, 'z'].join(' '))
    // .attr('transform', 'rotate(' + (recurringEndAngle / (Math.PI / 180)) + ')')
}

RPM.prototype.updateProjectItem = function (node, data, t, bottomT) {
  var len, width, value, th

  th = this
  len = th.itemOptions.project.length
  width = len * RPM.diagonalScale * RPM.xScale
  value = 0
  bottomT = (typeof bottomT === 'undefined') ? 0 : bottomT

  node.select('.project-progress').attr('d', getD(bottomT * len, len * value * t))
  node.select('.project-fill').attr('d', getD(bottomT * len + len * value * t, len * t - (bottomT * len + len * value * t)))
  node.select('.project-cap').attr('d', getCapD(len * t)).attr('class', 'project-cap')
  node.select('.project-center-line')
    .attr('x1', 0)
    .attr('y1', len / 2 - bottomT * len)
    .attr('x2', 0)
    .attr('y2', -len * t + len / 2)
  node.select('.direction-g').attr('transform', 'translate(0, ' + -(bottomT * len + len / 2) + ')')

  function getD (from, height) {
    return ['M', -width / 2, -from,
      'L', 0, -from + len / 2,
      width / 2, -from,
      width / 2, -from - height,
      -width / 2, -from - height, 'z'].join(' ')
  }

  function getCapD (from) {
    return ['M', -width / 2, -from,
      0, -from + len / 2,
      width / 2, -from,
      0, -from - len / 2, 'z'].join(' ')
  }
}

RPM.prototype.updateArrowHeads = function () {
  var markers, th, size

  th = this
  size = [6, 4]

  markers = th.defs.selectAll('.arrowhead').data([{name: 'link'}])
  markers.enter().append('marker')
    .attr('id', function (d) { return 'arrowhead-' + d.name })
    .attr('viewBox', '0,0 ' + size)
    .attr('orient', 'auto')
    .attr('refY', size[1] / 2)
    .attr('markerUnits', 'strokeWidth')
    .attr('markerWidth', size[0])
    .attr('markerHeight', size[1])
    .append('path')
      .attr('d', 'M 0 0 L ' + size[0] + ' ' + size[1] / 2 + ' L 0 ' + size[1] + ' z')
      .attr('fill', th.gradients[0].end.color)
      .attr('fill-opacity', th.gradients[0].end.opacity)

  markers.exit().remove()
}

RPM.prototype.getDLinks = function (d) {
  if (d.children) {
    let links,
      th,
      dependencies,
      useDraft,
      data,
      points,
      source,
      target,
      itemBox,
      intersectItemPt

    links = []
    th = this

    for (var i = 0; i < d.children.length; i++) {
      useDraft = (th.focusId === d.children[i].id) && d.children[i].data.draft
      data = useDraft ? d.children[i].data.draft : d.children[i].data
      dependencies = data.dependencies
      if (dependencies) {
        for (let k = 0; k < dependencies.length; k++) {
          source = d.children[i]
          target = th._flowerById[dependencies[k]]
          if (target && !target.data.recurring) {
            itemBox = th.getNodeBox(source)
            intersectItemPt = RPM.rectIntersect([target.x, target.y, source.x, source.y], itemBox)
            points = RPM.cropLine(target, intersectItemPt, 0, 10)
            // points = [source, intersectPt]

            points[1].x += 0.001
            points[1].y += 0.001

            links.push({source: source, target: target, cropped: points})
          }
        }
      }
    }
    return links
  }
  return []
}

RPM.prototype.updateFlower = function () {
  var th, root, idCounter, offset, mainNodesTotalLength

  th = this
  root = d3.hierarchy(th._data)
  idCounter = 0
  th._flowerById = {}
  th._withProposed = false
  offset = [0, 0]
  th.flower = {}
  mainNodesTotalLength = 0

  if (!th._data) {
    return {}
  }

  root.eachBefore(function (d) {
    if (!d.parent) {
      d.x = offset[0]
      d.y = offset[1]
      d.data.id = d.data.id || (d.data.type + String(idCounter++))
      d.id = d.data.id
      d.angle = Math.PI
      if (d.data.draft) {
        d.data.draft.id = d.data.id
      }
      if (d.data.proposed) {
        d.withProposed = true
      }
      th._flowerById[d.id] = d
    }

    if (d.children && d.children.length) {
      d.proposedChildren = d.children.filter((val) => { return val.data.proposed })
      d.completedChildren = d.children.filter((val) => { return (val.data.status === 'completed' || val.data.progress >= 1) && !val.data.recurring })
      d.proposedAngle = {min: Infinity, max: -Infinity}
      d.children = d.children.filter((val) => { return !val.data.proposed && (!((val.data.status === 'completed' || val.data.progress >= 1) && !val.data.recurring) || th._showCompleted) })

      if (!th._hideProposed) {
        d.children = d.children.concat(d.proposedChildren)
      }

      mainNodesTotalLength = getMainNodesTotalLength(d.children)
      d.mainRadius = Math.max(th._levelRadius, mainNodesTotalLength / Math.PI / 2)
      d.proposedRadius = d.mainRadius + th._proposedRadius - th._levelRadius
      addSet(d.children, d, d.mainRadius)

      for (let i = 0; i < d.proposedChildren.length; i++) {
        d.proposedAngle.min = Math.min(d.proposedAngle.min, d.proposedChildren[i].angle)
        d.proposedAngle.max = Math.max(d.proposedAngle.max, d.proposedChildren[i].angle)
      }
    }
  })

  root.eachAfter(function (d) {
    d.tasks = {total: 0, totalProgress: 0}
    if (d.children && d.children.length) {
      for (var i = 0; i < d.children.length; i++) {
        // let data = d.children[i].id === th.focusId ? (d.children[i].data.draft || d.children[i].data) : d.children[i].data
        let data = d.children[i].data
        if (data.type === 'task') {
          d.tasks.total ++
          d.tasks.totalProgress += (data.progress || 0)
        } else if (data.type === 'project') {
          d.tasks.total += d.children[i].tasks.total
          d.tasks.totalProgress += d.children[i].tasks.totalProgress
        }
      }
    }
    d.descendantsProgress = d.tasks.total ? d.tasks.totalProgress / d.tasks.total : 0
  })

  function addSet (set, d, radius) {
    let child, coord

    for (let i = 0; i < set.length; i++) {
      child = set[i]
      child.angle = i / (set.length) * Math.PI * 2 + Math.PI / 4
      coord = RPM.rotZ(0, -radius, child.angle)
      child.x = d.x + coord.x * RPM.xScale
      child.y = d.y + coord.y * RPM.yScale
      child.data.id = child.data.id || (child.data.type + String(idCounter++) + (child.data.proposed ? 'p' : '') + i)
      child.id = child.data.id
      if (child.data.draft) {
        child.data.draft.id = child.data.id
      }
      if (child.data.proposed) {
        d.withProposed = true
      }
      th._flowerById[child.id] = child
    }
  }

  function getMainNodesTotalLength (nodes) {
    var l = 0

    for (let i = 0; i < nodes.length; i++) {
      l += th.itemOptions[nodes[i].data.type].length + th.itemOptions[nodes[i].data.type].spacing
    }

    return l
  }

  th.flower = root
  return root
}

RPM.prototype.addDraftLabel = function (target) {
  var g, size, arrowSize, offset
  size = [76, 28]
  arrowSize = [15, 7]
  offset = -10

  g = target.append('g').attr('class', 'draft-g')
  g.append('rect')
    .attr('x', -size[0] / 2)
    .attr('y', -arrowSize[1] - size[1] + offset)
    .attr('width', size[0])
    .attr('height', size[1])
    .attr('rx', size[1] / 2)
    .attr('ry', size[1] / 2)

  g.append('text')
    .attr('y', -arrowSize[1] - size[1] / 2 + offset)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central').text('Draft')

  g.append('path')
    .attr('d', ['M', 0, offset, -arrowSize[0] / 2, -arrowSize[1] - 1 + offset, arrowSize[0] / 2, -arrowSize[1] - 1 + offset, 'z'].join(' '))
}

RPM.prototype.getFlowerById = function (id, nodes) {
  return this._flowerById[id]
}

RPM.yScale = 0.7071067812
RPM.xScale = 1.224744871
// RPM.xScale = 1
RPM.diagonalScale = 1.414213562

RPM.rotZ = function (x, y, angle) {
  var cos = Math.cos(angle)
  var sin = Math.sin(angle)
  var tx = x * cos - y * sin
  var ty = x * sin + y * cos
  return {x: tx, y: ty}
}

RPM.capitalize = function (word) {
  if (!word) {
    return word
  }
  return word[0].toUpperCase() + word.substr(1)
}

RPM.cropLine = function (p1, p2, l1, l2) {
  var dl, np1, np2, dc1, dc2

  dc1 = p2.x - p1.x
  dc2 = p2.y - p1.y
  dl = Math.sqrt(dc1 * dc1 + dc2 * dc2)

  np1 = {
    'x': p1.x + (p2.x - p1.x) * l1 / dl,
    'y': p1.y + (p2.y - p1.y) * l1 / dl
  }

  np2 = {
    'x': p1.x + (p2.x - p1.x) * (1 - l2 / dl),
    'y': p1.y + (p2.y - p1.y) * (1 - l2 / dl)
  }

  return [np1, np2]
}

RPM.getLineLength = function (x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

RPM.setLineLength = function (x1, y1, x2, y2, len) {
  var currentLength,
    scale

  currentLength = RPM.getLineLength(x1, y1, x2, y2)
  scale = len / currentLength

  return [x1, y1, x1 + (x2 - x1) * scale, y1 + (y2 - y1) * scale]
}

RPM.rectIntersect = function (line, rect) {
  var i,
    rectLines,
    lineLength,
    intersection,
    min

  rectLines = [
    [rect.x, rect.y, rect.x + rect.width, rect.y],
    [rect.x + rect.width, rect.y, rect.x + rect.width, rect.y + rect.height],
    [rect.x + rect.width, rect.y + rect.height, rect.x, rect.y + rect.height],
    [rect.x, rect.y + rect.height, rect.x, rect.y]
  ]

  min = {l: Infinity, pt: null}

  for (i = 0; i < rectLines.length; i++) {
    intersection = RPM.lineIntersect(line[0], line[1], line[2], line[3], rectLines[i][0], rectLines[i][1], rectLines[i][2], rectLines[i][3])

    if (intersection && intersection.seg1 && intersection.seg2) {
      lineLength = RPM.getLineLength(line[0], line[1], intersection.x, intersection.y)

      if (lineLength < min.l) {
        min.l = lineLength
        min.pt = intersection
      }
    }
  }

  return min.pt
}

RPM.lineIntersect = function (x1, y1, x2, y2, x3, y3, x4, y4) {
  var ua, ub, denom
  denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1)

  if (denom === 0) {
    return null
  }
  ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom
  ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom

  return {
    x: x1 + ua * (x2 - x1),
    y: y1 + ua * (y2 - y1),
    seg1: ua >= 0 && ua <= 1,
    seg2: ub >= 0 && ub <= 1
  }
}

RPM.prototype.getNodeBox = function (d) {
  var th
  th = this

  if (d.data.type === 'task') {
    return {
      x: -th.itemOptions.task.length / 2 + d.x,
      y: -th.itemOptions.task.length / 2 * RPM.yScale - th.itemOptions.task.height + d.y,
      width: th.itemOptions.task.length,
      height: th.itemOptions.task.length * RPM.yScale + th.itemOptions.task.height
    }
  } else {
    let width = th.itemOptions.project.length * 1.732050808

    return {
      x: -width / 2 + d.x,
      y: -th.itemOptions.project.length * 1.5 + d.y,
      width: width,
      height: th.itemOptions.project.length * 2
    }
  }
}

RPM.getNearestPointInPerimeter = function (x, y, rect) {
  var r, b, dl, dr, dt, db, m

  r = rect.x + rect.width
  b = rect.y + rect.height

  x = clamp(x, rect.x, r)
  y = clamp(y, rect.y, b)

  dl = Math.abs(x - rect.x)
  dr = Math.abs(x - r)
  dt = Math.abs(y - rect.y)
  db = Math.abs(y - b)
  m = Math.min(dl, dr, dt, db)

  if (m === dt) { return [x, rect.y] }
  if (m === db) { return [x, b] }
  if (m === dl) { return [rect.x, y] }

  return [r, y]

  function clamp (x, lower, upper) {
    return Math.max(lower, Math.min(upper, x))
  }
}

RPM.getRoundedRectData = function (x, y, width, height, corners) {
  var data, tr, br, bl, tl
  data = []
  tr = corners[0]
  br = corners[1]
  bl = corners[2]
  tl = corners[3]
  data.push('M' + (x + width / 2) + ',' + y)
  data.push('H' + (x + width - tr))

  if (tr > 0) {
    data.push('A' + arcParameter(tr, tr, 0, 0, 1, (x + width), (y + tr)))
  }

  data.push('V' + (y + height - br))

  if (br > 0) {
    data.push('A' + arcParameter(br, br, 0, 0, 1, (x + width - br), (y + height)))
  }

  data.push('H' + (x + bl))

  if (bl > 0) {
    data.push('A' + arcParameter(bl, bl, 0, 0, 1, (x + 0), (y + height - bl)))
  }

  data.push('V' + (y + tl))

  if (tl > 0) {
    data.push('A' + arcParameter(tl, tl, 0, 0, 1, (x + tl), (y + 0)))
  }

  data.push('Z')
  return data.join(' ')

  function arcParameter (rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y) {
    return [
      rx, ',',
      ry, ' ',
      xAxisRotation, ' ',
      largeArcFlag, ',',
      sweepFlag, ' ',
      x, ',', y ].join('')
  }
}

RPM.filledArray = function (length, value) {
  var arr = []
  for (let i = 0; i < length; i++) {
    arr.push(value)
  }
  return arr
}
