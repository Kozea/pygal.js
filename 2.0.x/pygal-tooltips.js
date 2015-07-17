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

  tooltip_timeout = 0;

  r_translation = /translate\((\d+)[ ,]+(\d+)\)/;

  get_translation = function(el) {
    return (r_translation.exec(el.getAttribute('transform')) || []).slice(1);
  };

  init = function(ctx) {
    var el, num, tooltip, untooltip, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3;
    _ref = $('.text-overlay .series', ctx);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      el = _ref[_i];
      el.style.display = 'none';
    }
    _ref1 = $('.reactive', ctx);
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      el = _ref1[_j];
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
    _ref2 = $('.activate-serie', ctx);
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      el = _ref2[_k];
      num = el.id.replace('activate-serie-', '');
      el.addEventListener('mouseenter', (function(num) {
        return function() {
          var ov, re, _l, _len3, _len4, _m, _ref3, _ref4, _results;
          _ref3 = $('.text-overlay .serie-' + num, ctx);
          for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
            ov = _ref3[_l];
            ov.style.display = '';
          }
          _ref4 = $('.serie-' + num + ' .reactive', ctx);
          _results = [];
          for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
            re = _ref4[_m];
            _results.push(re.classList.add('active'));
          }
          return _results;
        };
      })(num));
      el.addEventListener('mouseleave', (function(num) {
        return function() {
          var ov, re, _l, _len3, _len4, _m, _ref3, _ref4, _results;
          _ref3 = $('.text-overlay .serie-' + num, ctx);
          for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
            ov = _ref3[_l];
            ov.style.display = 'none';
          }
          _ref4 = $('.serie-' + num + ' .reactive', ctx);
          _results = [];
          for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
            re = _ref4[_m];
            _results.push(re.classList.remove('active'));
          }
          return _results;
        };
      })(num));
      el.addEventListener('click', (function(el, num) {
        return function() {
          var re, rect, _l, _len3, _ref3, _results;
          rect = $('rect', el).one();
          rect.style.fill = rect.style.fill === '' && 'transparent' || '';
          _ref3 = $('.serie-' + num + ' .reactive', ctx);
          _results = [];
          for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
            re = _ref3[_l];
            _results.push(re.style.display = re.style.display === '' && 'none' || '');
          }
          return _results;
        };
      })(el, num));
    }
    _ref3 = $('.tooltip-trigger', ctx);
    for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
      el = _ref3[_l];
      el.addEventListener('mouseenter', (function(el) {
        return function() {
          return tooltip(el);
        };
      })(el));
    }
    tooltip = function(el) {
      var baseline, cls, current_x, current_y, dy, h, key, keys, label, legend, name, parent, rect, serie_index, text, traversal, tspan, tspans, tt, value, value_index, w, x, x_elt, x_label, y, y_elt, _len4, _len5, _m, _n, _ref4, _ref5, _ref6, _ref7;
      clearTimeout(tooltip_timeout);
      tt = $('#tooltip,.tooltip', ctx).one();
      tt.style.opacity = 1;
      tt.style.display = '';
      text = $('g.text', tt).one();
      rect = $('rect', tt).one();
      text.innerHTML = '';
      label = sibl(el, '.label').one().textContent;
      value = sibl(el, '.value').one().textContent;
      serie_index = null;
      parent = el;
      traversal = [];
      while (parent) {
        parent = parent.parentElement;
        traversal.push(parent);
        if (parent.classList.contains('series')) {
          break;
        }
      }
      _ref4 = parent.classList;
      for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
        cls = _ref4[_m];
        if (cls.indexOf('serie-') === 0) {
          serie_index = +cls.replace('serie-', '');
          break;
        }
      }
      value_index = [].indexOf.call(traversal[traversal.length - 2].children, traversal[traversal.length - 3]);
      x_label = null;
      legend = null;
      if (serie_index !== null) {
        legend = config.legends[serie_index];
      }
      if (value_index !== null) {
        x_label = (_ref5 = config.x_labels) != null ? _ref5[value_index] : void 0;
      }
      dy = 0;
      keys = [[label, 'label'], [value, 'value']];
      if (config.tooltip_fancy_mode) {
        keys.unshift([x_label, 'x_label']);
        keys.unshift([legend, 'legend']);
      }
      tspans = {};
      for (_n = 0, _len5 = keys.length; _n < _len5; _n++) {
        _ref6 = keys[_n], key = _ref6[0], name = _ref6[1];
        if (key) {
          tspan = document.createElementNS(svg, 'text');
          tspan.textContent = key;
          tspan.setAttribute('x', padding);
          tspan.setAttribute('dy', dy);
          tspan.classList.add(name);
          if (name === 'value' && config.tooltip_fancy_mode) {
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
      }
      y = parseInt(y_elt.textContent);
      if (y_elt.classList.contains('centered')) {
        y -= h / 2;
      } else if (y_elt.classList.contains('top')) {
        y -= h;
      }
      _ref7 = get_translation(tt), current_x = _ref7[0], current_y = _ref7[1];
      if (current_x === x && current_y === y) {
        return;
      }
      return tt.setAttribute('transform', "translate(" + x + " " + y + ")");
    };
    return untooltip = function() {
      return tooltip_timeout = setTimeout(function() {
        var tt;
        tt = $('#tooltip,.tooltip', ctx).one();
        tt.style.display = 'none';
        return tt.style.opacity = 0;
      }, 1000);
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
