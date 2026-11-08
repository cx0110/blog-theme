/* 外观(浅色/深色/跟随系统)与配色方案(涨红跌绿之类)的运行时切换。
   状态存 localStorage,写在 <html data-theme data-scheme> 上。
   无依赖,不阻塞渲染:脚本以 defer 加载。 */
(function () {
  "use strict";

  var KEY_APPEARANCE = "blog-theme:appearance";
  var KEY_SCHEME = "blog-theme:scheme";
  var THEME_COLOR = { light: "#faf9f6", dark: "#13191c" };
  var root = document.documentElement;

  function read(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function write(key, value) {
    try {
      if (value === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, value);
    } catch (e) {
      /* 存储不可用(隐私模式等):本次会话内仍然生效,只是下次不记得。 */
    }
  }

  function systemTheme() {
    try {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch (e) {
      return "light";
    }
  }

  function resolve(pref) {
    return pref === "light" || pref === "dark" ? pref : systemTheme();
  }

  function syncRadios(attribute, value) {
    var buttons = document.querySelectorAll("[" + attribute + "]");
    for (var i = 0; i < buttons.length; i++) {
      var on = buttons[i].getAttribute(attribute) === value;
      buttons[i].setAttribute("aria-checked", on ? "true" : "false");
    }
  }

  function apply(appearance, scheme, animate) {
    var commit = function () {
      var theme = resolve(appearance);
      root.setAttribute("data-theme", theme);
      if (scheme) root.setAttribute("data-scheme", scheme);
      var metas = document.querySelectorAll('meta[name="theme-color"]');
      for (var i = 0; i < metas.length; i++) metas[i].setAttribute("content", THEME_COLOR[theme]);
    };

    var reduced = false;
    try {
      reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {
      reduced = false;
    }

    /* 页面不可见(切到别的标签页)时开过渡会被浏览器直接跳过,还会在控制台留一条
       "Transition was skipped"。看不见的时候本来也不需要过渡,直接切。 */
    var visible = true;
    try {
      visible = document.visibilityState === "visible";
    } catch (e) {
      visible = true;
    }

    if (animate && !reduced && visible && document.startViewTransition) {
      try {
        var transition = document.startViewTransition(commit);
        /* 过渡被跳过时(页面不可见、标签页切走等)ready 会 reject。
           不接住的话控制台会留下未处理的 promise 拒绝;再提交一次也无妨 —— 幂等。 */
        if (transition && transition.ready && typeof transition.ready.catch === "function") {
          transition.ready.catch(function () {
            commit();
          });
        }
        return;
      } catch (e) {
        /* 老浏览器不支持,直接切。 */
      }
    }
    commit();
  }

  var api = {
    getAppearance: function () {
      return read(KEY_APPEARANCE);
    },
    getScheme: function () {
      return read(KEY_SCHEME);
    },
    setAppearance: function (appearance) {
      write(KEY_APPEARANCE, appearance);
      apply(appearance, root.getAttribute("data-scheme"), true);
      syncRadios("data-appearance-set", appearance || "system");
    },
    setScheme: function (scheme) {
      write(KEY_SCHEME, scheme);
      apply(read(KEY_APPEARANCE), scheme, true);
      syncRadios("data-scheme-set", scheme);
    },
  };

  window.BlogThemeAppearance = api;

  /* 跟随系统时,系统切换深浅,页面要跟着变。 */
  try {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onChange = function () {
      if (!read(KEY_APPEARANCE)) apply(null, root.getAttribute("data-scheme"), false);
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  } catch (e) {
    /* 老浏览器没有 matchMedia 事件,忽略。 */
  }

  document.addEventListener("click", function (event) {
    var target = event.target;
    if (!target || !target.closest) return;

    var appearance = target.closest("[data-appearance-set]");
    if (appearance) {
      event.preventDefault();
      api.setAppearance(appearance.getAttribute("data-appearance-set"));
      closePanel(appearance);
      return;
    }

    var scheme = target.closest("[data-scheme-set]");
    if (scheme) {
      event.preventDefault();
      api.setScheme(scheme.getAttribute("data-scheme-set"));
      closePanel(scheme);
    }
  });

  /* 选完就收起下拉。 */
  function closePanel(element) {
    var details = element.closest("details");
    if (details) details.open = false;
  }

  /* 初始状态对齐到当前生效的值。 */
  syncRadios("data-appearance-set", read(KEY_APPEARANCE) || "system");
  syncRadios("data-scheme-set", root.getAttribute("data-scheme") || "");
})();
