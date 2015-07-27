(function() {
  var $, get_translation, init, init_svg, matches, padding, r_translation, sibl, svg, tooltip_timeout;

  svg = 'http://www.w3.org/2000/svg';

  $ = function(sel, ctx) {
    if (ctx == null) {
      ctx = null;
    }
    ctx = ctx || document;
    return Array.prototype.slice.call(ctx.querySelectorAll(sel), 0);
  };

  matches = function(el, selector) {
    return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
  };

  sibl = function(el, match) {
    if (match == null) {
      match = null;
    }
    return Array.prototype.filter.call(el.parentElement.children, function(child) {
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
      parent = inner_svg.parentElement;
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
          return el.classList.add('active');
        };
      })(el));
      el.addEventListener('mouseleave', (function(el) {
        return function() {
          return el.classList.remove('active');
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
            _results.push(re.classList.add('active'));
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
            _results.push(re.classList.remove('active'));
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
      return tooltip_el != null ? tooltip_el.classList.add('active') : void 0;
    });
    tt.addEventListener('mouseleave', function() {
      return tooltip_el != null ? tooltip_el.classList.remove('active') : void 0;
    });
    document.addEventListener('mouseleave', function() {
      if (!tooltip_el) {
        return;
      }
      if (tooltip_timeout) {
        clearTimeout(tooltip_timeout);
      }
      return untooltip(0);
    });
    graph.addEventListener('mousemove', function(el) {
      if (!tooltip_el) {
        return;
      }
      if (tooltip_timeout) {
        return;
      }
      if (!matches(el.target, '.background')) {
        return;
      }
      return untooltip(1000);
    });
    tooltip = function(el) {
      var baseline, cls, current_x, current_y, dy, h, i, key, keys, label, legend, name, plot_x, plot_y, rect, serie_index, subval, text, traversal, tspan, tspans, value, w, x, x_elt, x_label, y, y_elt, _l, _len3, _len4, _len5, _m, _n, _ref3, _ref4, _ref5, _ref6, _ref7;
      clearTimeout(tooltip_timeout);
      tooltip_timeout = null;
      tt.style.opacity = 1;
      tt.style.display = '';
      text = $('g.text', tt).one();
      rect = $('rect', tt).one();
      text.innerHTML = '';
      label = sibl(el, '.label').one().textContent;
      x_label = sibl(el, '.x_label').one().textContent;
      value = sibl(el, '.value').one().textContent;
      serie_index = null;
      parent = el;
      traversal = [];
      while (parent) {
        traversal.push(parent);
        if (parent.classList.contains('series')) {
          break;
        }
        parent = parent.parentElement;
      }
      if (parent) {
        _ref3 = parent.classList;
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
        keys.unshift([x_label, 'x_label']);
        keys.unshift([legend, 'legend']);
      }
      tspans = {};
      for (_n = 0, _len5 = keys.length; _n < _len5; _n++) {
        _ref5 = keys[_n], key = _ref5[0], name = _ref5[1];
        if (key) {
          tspan = document.createElementNS(svg, 'text');
          tspan.textContent = key;
          tspan.setAttribute('x', padding);
          tspan.setAttribute('dy', dy);
          tspan.classList.add(name.indexOf('value') === 0 ? 'value' : name);
          if (name.indexOf('value') === 0 && config.tooltip_fancy_mode) {
            tspan.classList.add('color-' + serie_index);
          }
          text.appendChild(tspan);
          dy += tspan.getBBox().height + padding / 2;
          baseline = padding;
          if (tspan.style.dominantBaseline !== void 0) {
            tspan.style.dominantBaseline = 'text-before-edge';
          } else {
            baseline += tspan.getBBox().height * .8;
          }
          tspan.setAttribute('y', baseline);
          tspans[name] = tspan;
        }
      }
      w = text.getBBox().width + 2 * padding;
      h = text.getBBox().height + 2 * padding;
      rect.setAttribute('width', w);
      rect.setAttribute('height', h);
      if (tspans.value) {
        tspans.value.setAttribute('dx', (w - tspans.value.getBBox().width) / 2 - padding);
      }
      if (tspans.x_label) {
        tspans.x_label.setAttribute('dx', w - tspans.x_label.getBBox().width - 2 * padding);
      }
      x_elt = sibl(el, '.x').one();
      y_elt = sibl(el, '.y').one();
      x = parseInt(x_elt.textContent);
      if (x_elt.classList.contains('centered')) {
        x -= w / 2;
      } else if (x_elt.classList.contains('left')) {
        x -= w;
      } else if (x_elt.classList.contains('auto')) {
        x = xconvert(el.getBBox().x + el.getBBox().width / 2) - w / 2;
      }
      y = parseInt(y_elt.textContent);
      if (y_elt.classList.contains('centered')) {
        y -= h / 2;
      } else if (y_elt.classList.contains('top')) {
        y -= h;
      } else if (y_elt.classList.contains('auto')) {
        y = yconvert(el.getBBox().y + el.getBBox().height / 2) - h / 2;
      }
      _ref6 = get_translation(tt.parentElement), plot_x = _ref6[0], plot_y = _ref6[1];
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
        return;
      }
      tt.setAttribute('transform', "translate(" + x + " " + y + ")");
      return el;
    };
    return untooltip = function(ms) {
      return tooltip_timeout = setTimeout(function() {
        tt.style.display = 'none';
        tt.style.opacity = 0;
        if (tooltip_el != null) {
          tooltip_el.classList.remove('active');
        }
        tooltip_el = null;
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

  if (document.readyState !== 'loading') {
    init_svg();
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      return init_svg();
    });
  }

}).call(this);
