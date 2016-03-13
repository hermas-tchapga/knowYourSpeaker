(function (e) {
    typeof module === "object" && module.exports ? module.exports = e : e(Highcharts)
})(function (e) {
    function u() {
        return Array.prototype.slice.call(arguments, 1)
    }

    function s(d) {
        d.apply(this);
        this.drawBreaks()
    }

    var q = e.pick, o = e.wrap, r = e.each, v = e.extend, t = e.fireEvent, p = e.Axis, w = e.Series;
    v(p.prototype, {
        isInBreak: function (d, h) {
            var a = d.repeat || Infinity, b = d.from, c = d.to - d.from, a = h >= b ? (h - b) % a : a - (b - h) % a;
            return d.inclusive ? a <= c : a < c && a !== 0
        }, isInAnyBreak: function (d, h) {
            var a = this.options.breaks, b = a && a.length, c, f, j;
            if (b) {
                for (; b--;)this.isInBreak(a[b], d) && (c = !0, f || (f = q(a[b].showPoints, this.isXAxis ? !1 : !0)));
                j = c && h ? c && !f : c
            }
            return j
        }
    });
    o(p.prototype, "setTickPositions", function (d) {
        d.apply(this, Array.prototype.slice.call(arguments, 1));
        if (this.options.breaks) {
            var h = this.tickPositions, a = this.tickPositions.info, b = [], c;
            for (c = 0; c < h.length; c++)this.isInAnyBreak(h[c]) || b.push(h[c]);
            this.tickPositions = b;
            this.tickPositions.info = a
        }
    });
    o(p.prototype, "init", function (d, h, a) {
        if (a.breaks && a.breaks.length)a.ordinal = !1;
        d.call(this,
            h, a);
        if (this.options.breaks) {
            var b = this;
            b.isBroken = !0;
            this.val2lin = function (c) {
                var f = c, a, d;
                for (d = 0; d < b.breakArray.length; d++)if (a = b.breakArray[d], a.to <= c)f -= a.len; else if (a.from >= c)break; else if (b.isInBreak(a, c)) {
                    f -= c - a.from;
                    break
                }
                return f
            };
            this.lin2val = function (c) {
                var f, a;
                for (a = 0; a < b.breakArray.length; a++)if (f = b.breakArray[a], f.from >= c)break; else f.to < c ? c += f.len : b.isInBreak(f, c) && (c += f.len);
                return c
            };
            this.setExtremes = function (c, a, b, d, h) {
                for (; this.isInAnyBreak(c);)c -= this.closestPointRange;
                for (; this.isInAnyBreak(a);)a -=
                    this.closestPointRange;
                p.prototype.setExtremes.call(this, c, a, b, d, h)
            };
            this.setAxisTranslation = function (c) {
                p.prototype.setAxisTranslation.call(this, c);
                var a = b.options.breaks, c = [], d = [], h = 0, k, g, e = b.userMin || b.min, l = b.userMax || b.max, i, n;
                for (n in a)g = a[n], k = g.repeat || Infinity, b.isInBreak(g, e) && (e += g.to % k - e % k), b.isInBreak(g, l) && (l -= l % k - g.from % k);
                for (n in a) {
                    g = a[n];
                    i = g.from;
                    for (k = g.repeat || Infinity; i - k > e;)i -= k;
                    for (; i < e;)i += k;
                    for (; i < l; i += k)c.push({value: i, move: "in"}), c.push({
                        value: i + (g.to - g.from), move: "out",
                        size: g.breakSize
                    })
                }
                c.sort(function (a, c) {
                    return a.value === c.value ? (a.move === "in" ? 0 : 1) - (c.move === "in" ? 0 : 1) : a.value - c.value
                });
                a = 0;
                i = e;
                for (n in c) {
                    g = c[n];
                    a += g.move === "in" ? 1 : -1;
                    if (a === 1 && g.move === "in")i = g.value;
                    a === 0 && (d.push({from: i, to: g.value, len: g.value - i - (g.size || 0)}), h += g.value - i - (g.size || 0))
                }
                b.breakArray = d;
                t(b, "afterBreaks");
                b.transA *= (l - b.min) / (l - e - h);
                b.min = e;
                b.max = l
            }
        }
    });
    o(w.prototype, "generatePoints", function (d) {
        d.apply(this, u(arguments));
        var e = this.xAxis, a = this.yAxis, b = this.points, c, f = b.length,
            j = this.options.connectNulls, m;
        if (e && a && (e.options.breaks || a.options.breaks))for (; f--;)if (c = b[f], m = c.y === null && j === !1, !m && (e.isInAnyBreak(c.x, !0) || a.isInAnyBreak(c.y, !0)))b.splice(f, 1), this.data[f] && this.data[f].destroyElements()
    });
    e.Series.prototype.drawBreaks = function () {
        var d = this, e = d.points, a, b, c, f, j;
        r(["y", "x"], function (m) {
            a = d[m + "Axis"];
            b = a.breakArray || [];
            c = a.isXAxis ? a.min : q(d.options.threshold, a.min);
            r(e, function (d) {
                j = q(d["stack" + m.toUpperCase()], d[m]);
                r(b, function (b) {
                    f = !1;
                    if (c < b.from && j > b.to ||
                        c > b.from && j < b.from)f = "pointBreak"; else if (c < b.from && j > b.from && j < b.to || c > b.from && j > b.to && j < b.from)f = "pointInBreak";
                    f && t(a, f, {point: d, brk: b})
                })
            })
        })
    };
    o(e.seriesTypes.column.prototype, "drawPoints", s);
    o(e.Series.prototype, "drawPoints", s)
});