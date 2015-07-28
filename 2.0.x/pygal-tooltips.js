(function() {
  var $, addClass, getClass, get_translation, hasClass, ie9, init, init_svg, matches, padding, r_translation, removeClass, sibl, svg_ns, tooltip_timeout, xlink_ns;

  svg_ns = 'http://www.w3.org/2000/svg';

  xlink_ns = 'http://www.w3.org/1999/xlink';

  $ = function(sel, ctx) {
    if (ctx == null) {
      ctx = null;
    }
    ctx = ctx || document;
    return Array.prototype.slice.call(ctx.querySelectorAll(sel), 0);
  };

  addClass = function(elt, cls) {
    if (elt.classList) {
      return elt.classList.add(cls);
    } else {
      return elt.className.baseVal += ' ' + cls;
    }
  };

  removeClass = function(elt, cls) {
    if (elt.classList) {
      return elt.classList.remove(className);
    } else {
      return elt.className.baseVal = elt.className.baseVal.replace(new RegExp('(^|\\b)' + elt.className.baseVal.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
  };

  hasClass = function(elt, cls) {
    if (elt.classList) {
      return elt.classList.contains(cls);
    } else {
      return elt.className.baseVal.split(' ').indexOf(cls > -1);
    }
  };

  getClass = function(elt) {
    if (elt.classList) {
      return elt.classList;
    } else {
      return elt.className.baseVal.split(' ');
    }
  };

  matches = function(el, selector) {
    return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
  };

  sibl = function(el, match) {
    if (match == null) {
      match = null;
    }
    return Array.prototype.filter.call(el.parentNode.childNodes, function(child) {
      return child !== el && (!match || matches(child, match));
    });
  };

  Array.prototype.one = function() {
    return this.length > 0 && this[0] || {};
  };

  padding = 5;

  tooltip_timeout = null;

  r_translation = /translate\((\d+)[ ,]+(\d+)\)/;

  get_translation = function(el) {
    return (r_translation.exec(el.getAttribute('transform')) || []).slice(1).map(function(x) {
      return +x;
    });
  };

  init = function(ctx) {
    var bbox, box, el, graph, inner_svg, num, parent, tooltip, tooltip_el, tt, untooltip, xconvert, yconvert, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
    if ($('svg', ctx).length) {
      inner_svg = $('svg')[1];
      parent = inner_svg.parentNode;
      box = inner_svg.viewBox.baseVal;
      bbox = parent.getBBox();
      xconvert = function(x) {
        return ((x - box.x) / box.width) * bbox.width;
      };
      yconvert = function(y) {
        return ((y - box.y) / box.height) * bbox.height;
      };
    } else {
      xconvert = yconvert = function(x) {
        return x;
      };
    }
    tooltip_el = null;
    graph = $('.graph').one();
    tt = $('.tooltip', ctx).one();
    _ref = $('.reactive', ctx);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      el = _ref[_i];
      el.addEventListener('mouseenter', (function(el) {
        return function() {
          return addClass(el, 'active');
        };
      })(el));
      el.addEventListener('mouseleave', (function(el) {
        return function() {
          return removeClass(el, 'active');
        };
      })(el));
    }
    _ref1 = $('.activate-serie', ctx);
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      el = _ref1[_j];
      num = el.id.replace('activate-serie-', '');
      el.addEventListener('mouseenter', (function(num) {
        return function() {
          var re, _k, _len2, _ref2, _results;
          _ref2 = $('.serie-' + num + ' .reactive', ctx);
          _results = [];
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            re = _ref2[_k];
            _results.push(addClass(re, 'active'));
          }
          return _results;
        };
      })(num));
      el.addEventListener('mouseleave', (function(num) {
        return function() {
          var re, _k, _len2, _ref2, _results;
          _ref2 = $('.serie-' + num + ' .reactive', ctx);
          _results = [];
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            re = _ref2[_k];
            _results.push(removeClass(re, 'active'));
          }
          return _results;
        };
      })(num));
      el.addEventListener('click', (function(el, num) {
        return function() {
          var ov, re, rect, show, _k, _l, _len2, _len3, _ref2, _ref3, _results;
          rect = $('rect', el).one();
          show = rect.style.fill !== '';
          rect.style.fill = show ? '' : 'transparent';
          _ref2 = $('.serie-' + num + ' .reactive', ctx);
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            re = _ref2[_k];
            re.style.display = show ? '' : 'none';
          }
          _ref3 = $('.text-overlay .serie-' + num, ctx);
          _results = [];
          for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
            ov = _ref3[_l];
            _results.push(ov.style.display = show ? '' : 'none');
          }
          return _results;
        };
      })(el, num));
    }
    _ref2 = $('.tooltip-trigger', ctx);
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      el = _ref2[_k];
      el.addEventListener('mouseenter', (function(el) {
        return function() {
          return tooltip_el = tooltip(el);
        };
      })(el));
    }
    tt.addEventListener('mouseenter', function() {
      if (!tooltip_el) {
        return;
      }
      return addClass(tooltip_el, 'active');
    });
    tt.addEventListener('mouseleave', function() {
      if (!tooltip_el) {
        return;
      }
      return removeClass(tooltip_el, 'active');
    });
    document.addEventListener('mouseleave', function() {
      if (tooltip_timeout) {
        clearTimeout(tooltip_timeout);
      }
      return untooltip(0);
    });
    graph.addEventListener('mousemove', function(el) {
      if (tooltip_timeout) {
        return;
      }
      if (!matches(el.target, '.background')) {
        return;
      }
      return untooltip(1000);
    });
    tooltip = function(el) {
      var a, baseline, cls, current_x, current_y, dy, h, i, key, keys, label, legend, name, plot_x, plot_y, rect, serie_index, subval, text, text_group, texts, traversal, value, w, x, x_elt, x_label, xlink, y, y_elt, _l, _len3, _len4, _len5, _m, _n, _ref3, _ref4, _ref5, _ref6, _ref7;
      clearTimeout(tooltip_timeout);
      tooltip_timeout = null;
      tt.style.opacity = 1;
      tt.style.display = '';
      text_group = $('g.text', tt).one();
      rect = $('rect', tt).one();
      text_group.innerHTML = '';
      label = sibl(el, '.label').one().textContent;
      x_label = sibl(el, '.x_label').one().textContent;
      value = sibl(el, '.value').one().textContent;
      xlink = sibl(el, '.xlink').one().textContent;
      serie_index = null;
      parent = el;
      traversal = [];
      while (parent) {
        traversal.push(parent);
        if (hasClass(parent, 'series')) {
          break;
        }
        parent = parent.parentNode;
      }
      if (parent) {
        _ref3 = getClass(parent);
        for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
          cls = _ref3[_l];
          if (cls.indexOf('serie-') === 0) {
            serie_index = +cls.replace('serie-', '');
            break;
          }
        }
      }
      legend = null;
      if (serie_index !== null) {
        legend = config.legends[serie_index];
      }
      dy = 0;
      keys = [[label, 'label']];
      _ref4 = value.split('\n');
      for (i = _m = 0, _len4 = _ref4.length; _m < _len4; i = ++_m) {
        subval = _ref4[i];
        keys.push([subval, 'value-' + i]);
      }
      if (config.tooltip_fancy_mode) {
        keys.push([xlink, 'xlink']);
        keys.unshift([x_label, 'x_label']);
        keys.unshift([legend, 'legend']);
      }
      texts = {};
      for (_n = 0, _len5 = keys.length; _n < _len5; _n++) {
        _ref5 = keys[_n], key = _ref5[0], name = _ref5[1];
        if (key) {
          text = document.createElementNS(svg_ns, 'text');
          text.textContent = key;
          text.setAttribute('x', padding);
          text.setAttribute('dy', dy);
          addClass(text, name.indexOf('value') === 0 ? 'value' : name);
          if (name.indexOf('value') === 0 && config.tooltip_fancy_mode) {
            addClass(text, 'color-' + serie_index);
          }
          if (name === 'xlink') {
            a = document.createElementNS(svg_ns, 'a');
            a.setAttributeNS(xlink_ns, 'href', key);
            a.textContent = void 0;
            a.appendChild(text);
            text.textContent = 'Link >';
            text_group.appendChild(a);
          } else {
            text_group.appendChild(text);
          }
          dy += text.getBBox().height + padding / 2;
          baseline = padding;
          if (text.style.dominantBaseline !== void 0) {
            text.style.dominantBaseline = 'text-before-edge';
          } else {
            baseline += text.getBBox().height * .8;
          }
          text.setAttribute('y', baseline);
          texts[name] = text;
        }
      }
      w = text_group.getBBox().width + 2 * padding;
      h = text_group.getBBox().height + 2 * padding;
      rect.setAttribute('width', w);
      rect.setAttribute('height', h);
      if (texts.value) {
        texts.value.setAttribute('dx', (w - texts.value.getBBox().width) / 2 - padding);
      }
      if (texts.x_label) {
        texts.x_label.setAttribute('dx', w - texts.x_label.getBBox().width - 2 * padding);
      }
      if (texts.xlink) {
        texts.xlink.setAttribute('dx', w - texts.xlink.getBBox().width - 2 * padding);
      }
      x_elt = sibl(el, '.x').one();
      y_elt = sibl(el, '.y').one();
      x = parseInt(x_elt.textContent);
      if (hasClass(x_elt, 'centered')) {
        x -= w / 2;
      } else if (hasClass(x_elt, 'left')) {
        x -= w;
      } else if (hasClass(x_elt, 'auto')) {
        x = xconvert(el.getBBox().x + el.getBBox().width / 2) - w / 2;
      }
      y = parseInt(y_elt.textContent);
      if (hasClass(y_elt, 'centered')) {
        y -= h / 2;
      } else if (hasClass(y_elt, 'top')) {
        y -= h;
      } else if (hasClass(y_elt, 'auto')) {
        y = yconvert(el.getBBox().y + el.getBBox().height / 2) - h / 2;
      }
      _ref6 = get_translation(tt.parentNode), plot_x = _ref6[0], plot_y = _ref6[1];
      if (x + w + plot_x > config.width) {
        x = config.width - w - plot_x;
      }
      if (y + h + plot_y > config.height) {
        y = config.height - h - plot_y;
      }
      if (x + plot_x < 0) {
        x = -plot_x;
      }
      if (y + plot_y < 0) {
        y = -plot_y;
      }
      _ref7 = get_translation(tt), current_x = _ref7[0], current_y = _ref7[1];
      if (current_x === x && current_y === y) {
        return el;
      }
      tt.setAttribute('transform', "translate(" + x + " " + y + ")");
      return el;
    };
    return untooltip = function(ms) {
      return tooltip_timeout = setTimeout(function() {
        tt.style.display = 'none';
        tt.style.opacity = 0;
        tooltip_el && removeClass(tooltip_el, 'active');
        return tooltip_timeout = null;
      }, ms);
    };
  };

  init_svg = function() {
    var chart, charts, _i, _len, _results;
    charts = $('.pygal-chart');
    if (charts.length) {
      _results = [];
      for (_i = 0, _len = charts.length; _i < _len; _i++) {
        chart = charts[_i];
        _results.push(init(chart));
      }
      return _results;
    } else {
      return init();
    }
  };

  ie9 = document.all && !window.atob;

  if (document.readyState !== 'loading' && !(ie9 || document.readyState === 'complete')) {
    init_svg();
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      return init_svg();
    });
  }

}).call(this);
