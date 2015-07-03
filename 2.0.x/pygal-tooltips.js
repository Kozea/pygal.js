(function() {
  var $, get_translation, init, init_svg, matches, padding, r_translation, sibl, tooltip_timeout;

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
    return Array.prototype.filter.call(el.parentNode.children, function(child) {
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
      el.addEventListener('mouseleave', (function(el) {
        return function() {
          return untooltip(el);
        };
      })(el));
    }
    tooltip = function(el) {
      var a, current_x, current_y, h, label, rect, target, text, tt, value, w, x, x_elt, xlink, y, y_elt, _len4, _m, _ref4, _ref5;
      clearTimeout(tooltip_timeout);
      tt = $('#tooltip,.tooltip', ctx).one();
      tt.style.opacity = 1;
      tt.style.display = '';
      text = $('text', tt).one();
      label = $('tspan.label', tt).one();
      value = $('tspan.value', tt).one();
      rect = $('rect', tt).one();
      if (sibl(el, '.tooltip').length) {
        label.textContent = sibl(el, '.tooltip').one().textContent;
        value.textContent = '';
      } else {
        label.textContent = sibl(el, '.label').one().textContent;
        value.textContent = sibl(el, '.value').one().textContent;
      }
      xlink = sibl(el, '.xlink').one().textContent || null;
      target = el.parentNode.getAttribute('target');
      if (xlink) {
        _ref4 = $(tt, 'a');
        for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
          a = _ref4[_m];
          a.setAttribute('href', xlink);
          a.setAttribute('target', target);
        }
      }
      text.setAttribute('x', padding);
      text.setAttribute('y', padding + this.config.tooltip_font_size);
      value.setAttribute('x', padding);
      value.setAttribute('dy', label.textContent ? this.config.tooltip_font_size + padding : 0);
      w = text.offsetWidth + 2 * padding;
      h = text.offsetHeight + 2 * padding;
      rect.setAttribute('width', w);
      rect.setAttribute('height', h);
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
      _ref5 = get_translation(tt), current_x = _ref5[0], current_y = _ref5[1];
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
