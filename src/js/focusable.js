! function(a) {
    function b() { u = $("body"), c(), p(), d() }

    function c() { window.jQuery && window.$ && window.$.fn && ($.fn.focusable = function(a) { return Focusable.setFocus(this, a), this }) }

    function d() { u.on("click", y, g), $(window).on("resize", e), $(window).on("keyup", f) }

    function e() { v && (v = z.findOnResize ? $(v.selector) : v, t()) }

    function f(a) { z.hideOnESC && 27 === a.keyCode && w && j() }

    function g() { z.hideOnClick && j() }

    function h(a, b) { $("body").css("overflow", "hidden"), z = $.extend(z, b), v = a, k(), z.circle && n(), u.find(y).fadeIn(z.fadeDuration) }

    function i() { u.find(y).remove() }

    function j() { w = !1, v = null, $("body").css("overflow", ""), u.find(y).fadeOut(z.fadeDuration, i) }

    function k(a) { if (v) { var b = 0; for (w = !0, i(); 4 > b;) l(b), b++;
            a === !0 && $(y).show() } }

    function l(a) { var b = v.offset(),
            c = 0,
            d = 0,
            e = o(v.outerWidth()),
            f = "100%",
            g = ""; switch (a) {
            case 0:
                e = o(b.left); break;
            case 1:
                d = o(b.left), f = o(b.top); break;
            case 2:
                d = o(b.left), c = o(v.outerHeight() + b.top); break;
            case 3:
                e = "100%", d = o(v.outerWidth() + b.left) } g = "top:" + c + ";left:" + d + ";width:" + e + ";height:" + f, u.prepend('<div class="' + x + '" style="' + g + '"></div>') }

    function m(a, b, c) { return $("<svg width=" + a + " height=" + b + '><defs>    <mask id="hole">        <rect width="100%" height="100%" fill="white"/>        <circle r="' + c + '" cx="' + a / 2 + '" cy="' + b / 2 + '" />    </mask></defs><rect id="donut" style="fill:rgba(0,0,0,0.8);" width="' + a + '" height="' + b + '" mask="url(#hole)" /></svg>') }

    function n() { var a = v.get(0).getBoundingClientRect(),
            b = m(a.width, a.height, Math.min(a.width / 2, a.height / 2));
        b.attr("class", x), b.css({ left: a.left, top: a.top, background: "transparent" }), u.prepend(b) }

    function o(a) { return a + "px" }

    function p() { var a = function() { var a = document.createElement("style"); return a.appendChild(document.createTextNode("")), document.head.appendChild(a), a.sheet }();
        a.insertRule(y + "{ display:none; position: absolute; z-index: 9999; background: rgba(0,0,0,0.8); }", 0) }

    function q() { return v }

    function r() { return z }

    function s() { return w }

    function t() { k(!0) } var u = null,
        v = null,
        w = !1,
        x = "focusable-column",
        y = "." + x,
        z = { fadeDuration: 700, hideOnClick: !1, hideOnESC: !1, findOnResize: !1 };
    $(document).ready(b), a.Focusable = { setFocus: h, hide: j, refresh: t, getActiveElement: q, getOptions: r, isVisible: s } }(window);