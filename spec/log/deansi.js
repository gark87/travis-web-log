(function() {
  var progress;

  progress = function(total, callback) {
    var count, curr, ix, part, result, step, _i;
    total -= 1;
    result = [];
    step = Math.ceil(100 / total);
    part = Math.ceil(total / 100);
    curr = 1;
    ix = 0;
    for (count = _i = 1; _i <= 99; count = _i += step) {
      count = count.toString();
      count = Array(4 - count.length).join(' ') + count;
      result.push(callback(ix, count, curr, total));
      ix += 1;
      curr += part;
      if (curr > total) {
        curr = total;
      }
    }
    result.push(callback(ix, 100, total + 1, total + 1));
    return result;
  };

  describe('deansi', function() {
    var format;
    beforeEach(function() {
      while (log.firstChild) {
        log.removeChild(log.firstChild);
      }
      this.log = new Log();
      return this.render = function(parts) {
        return render(this, parts);
      };
    });
    format = function(html) {
      return html.replace(/<p><span/gm, '<p>\n  <span').replace(/<div/gm, '\n<div').replace(/<p>/gm, '\n<p>').replace(/<\/p>/gm, '\n</p>');
    };
    describe('carriage returns and newlines', function() {
      it('nl', function() {
        var html;
        html = this.render([[0, 'foo\n']]);
        return expect(html).toBe('<p><span id="0-0">foo</span></p>');
      });
      it('cr nl', function() {
        var html;
        html = this.render([[0, 'foo\r\n']]);
        return expect(html).toBe('<p><span id="0-0">foo</span></p>');
      });
      it('cr cr nl', function() {
        var html;
        html = this.render([[0, 'foo\r\r\n']]);
        return expect(html).toBe('<p><span id="0-0">foo</span></p>');
      });
      return it('cr', function() {
        var html;
        html = this.render([[0, 'foo\r']]);
        return expect(html).toBe('<p><span id="0-0" class="clears"></span></p>');
      });
    });
    it('clear line works', function() {
      var html;
      html = this.render([[0, '\x1b[0m\x1b[1000D\x1b[?25l\x1b[32m  5%\x1b[0m\x1b[1000D\x1b[?25l\x1b[32m 11%']]);
      return expect(html).toBe('<p><span id="0-2" class="clears"></span><span id="0-3" class="green"> 11%</span></p>');
    });
    it('can cope with hide/show cursor', function() {
      var html;
      html = this.render([[0, 'foo\x1b[?25h\n\x1b[1000D\x1b[K\n']]);
      return expect(html).toBe(strip('<p><span id="0-0">foo</span></p>\n<p><span id="0-1" class="clears"></span><span id="0-2"></span></p>'));
    });
    it('removes spans before a clearing span', function() {
      var html;
      html = strip('<p><span id="0-0">foo</span></p>\n<p><span id="3-0" class="clears"></span><span id="4-0">bam</span></p>');
      return expect(this.render([[0, 'foo\nbar'], [1, 'baz'], [4, 'bam'], [3, 'bum\r'], [2, 'buz']])).toBe(html);
    });
    describe('progress (1)', function() {
      beforeEach(function() {
        return this.html = strip('<p>\n  <span id="2-0" class="clears"></span>\n  <span id="2-1">Done.</span>\n</p>');
      });
      it('clears the line if the carriage return sits on the next part (ordered)', function() {
        return expect(this.render([[0, '0%\r1%'], [1, '\r2%\r'], [2, '\rDone.']])).toBe(this.html);
      });
      it('clears the line if the carriage return sits on the next part (unordered, 1)', function() {
        return expect(this.render([[1, '\r2%\r'], [2, '\rDone.'], [0, '0%\r1%']])).toBe(this.html);
      });
      return it('clears the line if the carriage return sits on the next part (unordered, 3)', function() {
        return expect(this.render([[2, '\rDone.'], [1, '\r2%\r'], [0, '0%\r1%']])).toBe(this.html);
      });
    });
    describe('progress (2)', function() {
      beforeEach(function() {
        return this.html = strip('<p>\n  <span id="0-0">foo</span>\n  <span id="1-0"></span>\n</p>\n<p>\n  <span id="4-0" class="clears"></span>\n  <span id="4-1">3%</span>\n</p>');
      });
      it('ordered', function() {
        return expect(this.render([[0, 'foo'], [1, '\n'], [2, '\r1%'], [3, '\r2%'], [4, '\r3%']])).toBe(this.html);
      });
      it('unordered (1)', function() {
        return expect(this.render([[0, 'foo'], [2, '\r1%'], [1, '\n'], [4, '\r3%'], [3, '\r2%']])).toBe(this.html);
      });
      it('unordered (2)', function() {
        return expect(this.render([[1, '\n'], [3, '\r2%'], [2, '\r1%'], [0, 'foo'], [4, '\r3%']])).toBe(this.html);
      });
      return it('unordered (3)', function() {
        return expect(this.render([[4, '\r3%'], [3, '\r2%'], [2, '\r1%'], [0, 'foo'], [1, '\n']])).toBe(this.html);
      });
    });
    it('progress (2)', function() {
      var html, log;
      log = 'Started\r\n\r\n\x1b[1000D\x1b[?25l\x1b[32m1/36: [= ] 50% 00:00:00\x1b[0m\x1b[1000D\x1b[?25l\x1b[32m36/36: [==] 9.0/s 100% 00:00:04\x1b[0m\x1b[1000D\x1b[?25l\x1b[32m36/36: [==] 9.0/s 100% 00:00:04\x1b[0m\x1b[?25h\r\n\x1b[0m\x1b[1000D\x1b[K\r\nFinished in 4.76991s\r\n';
      html = strip('<p><span id="0-0">Started</span></p>\n<p><span id="0-1"></span></p>\n<p><span id="0-6" class="clears"></span><span id="0-7" class="green">36/36: [==] 9.0/s 100% 00:00:04</span><span id="0-8"></span></p>\n<p><span id="0-9" class="clears"></span><span id="0-10"></span></p>\n<p><span id="0-11">Finished in 4.76991s</span></p>');
      return expect(this.render([[0, log]])).toBe(html);
    });
    it('simulating git clone', function() {
      return rescueing(this, function() {
        var html, lines;
        html = strip('<p><span id="0-0">Cloning into \'jsdom\'...</span></p>\n<p><span id="1-0">remote: Counting objects: 13358, done.</span></p>\n<p>\n  <span id="5-0" class="clears"></span>\n  <span id="6-0">remote: Compressing objects 100% (5/5), done.</span></p>\n<p>\n  <span id="10-0" class="clears"></span>\n  <span id="11-0">Receiving objects 100% (5/5), done.</span></p>\n<p>\n  <span id="15-0" class="clears"></span>\n  <span id="16-0">Resolving deltas: 100% (5/5), done.</span>\n</p>\n<p><span id="17-0">Something else.</span></p>');
        lines = progress(5, function(ix, count, curr, total) {
          var end;
          end = count === 100 ? ", done.\x1b[K\n" : "   \x1b[K\r";
          return [ix + 2, "remote: Compressing objects " + count + "% (" + curr + "/" + total + ")" + end];
        });
        lines = lines.concat(progress(5, function(ix, count, curr, total) {
          var end;
          end = count === 100 ? ", done.\n" : "   \r";
          return [ix + 7, "Receiving objects " + count + "% (" + curr + "/" + total + ")" + end];
        }));
        lines = lines.concat(progress(5, function(ix, count, curr, total) {
          var end;
          end = count === 100 ? ", done.\n" : "   \r";
          return [ix + 12, "Resolving deltas: " + count + "% (" + curr + "/" + total + ")" + end];
        }));
        lines = [[0, "Cloning into 'jsdom'...\n"], [1, "remote: Counting objects: 13358, done.\x1b[K\n"]].concat(lines);
        lines = lines.concat([[17, 'Something else.']]);
        return expect(this.render(lines)).toBe(html);
      });
    });
    it('random part sizes w/ dot output', function() {
      var html, parts;
      html = strip('<p>\n  <span id="1-0" class="green bold">.</span>\n</p>');
      parts = [[1, "\u001b[32m\u001b[0;1m.\u001b[0;0m\u001b[0m"]];
      return expect(this.render(parts)).toBe(html);
    });
    it('properly sets multipla classes', function() {
      var html, parts;
      html = strip('<p>\n  <span id="1-0" class="green">.</span>\n  <span id="2-0" class="green">.</span>\n  <span id="3-0" class="green">.</span>\n  <span id="3-1" class="yellow">*</span>\n  <span id="3-2" class="yellow">*</span>\n  <span id="4-0" class="yellow">*</span>\n</p>');
      parts = [[1, "\u001b[32m.\u001b[0m"], [2, "\u001b[32m.\u001b[0m"], [3, "\u001b[32m.\u001b[0m\u001b[33m*\u001b[0m\u001b[33m*\u001b[0m"], [4, "\u001b[33m*\u001b[0m"]];
      return expect(this.render(parts)).toBe(html);
    });
    it('wild thing with a fold and <cr>s at the beginning of the line', function() {
      var html, parts;
      html = strip('<p><span id="2-0" class="clears"></span><span id="2-1">foo.2</span></p>\n<p><span id="3-0" class="clears"></span><span id="3-1">bar.3</span></p>\n<div id="fold-start-install" class="fold-start"><span class="fold-name">install</span></div>\n<p><span id="5-0" class="clears"></span></p>');
      parts = [[1, 'foo.1'], [2, '\rfoo.2\r\n'], [3, 'bar.2\rbar.3\r\n'], [4, 'travis_fold:start:install\r'], [5, '\r']];
      return expect(this.render(parts)).toBe(html);
    });
    it('wild thing with ansi parts preceeding a <cr> inserted late', function() {
      var html, parts;
      html = strip('<p><span id="0-0">foo</span><span id="0-1">bar</span></p>\n<p><span id="1-0" class="clears"></span><span id="1-1">baz</span></p>');
      parts = [[1, '\rbaz\r\n'], [0, '\u001b[0mfoo\u001b[0mbar\r\n\r']];
      return expect(this.render(parts)).toBe(html);
    });
    it('clears a span when inserted late on a part that has a newline', function() {
      var html, parts;
      html = strip('<p>\n  <span id="1-0">foo</span>\n</p>\n<p>\n  <span id="2-0" class="clears"></span><span id="2-1">baz</span>\n</p>');
      parts = [[2, "\rbaz"], [1, "foo\nbar"]];
      return expect(this.render(parts)).toBe(html);
    });
    return it('renders unescaped "eM" correctly', function() {
      var html, parts;
      html = strip('<p>\n  <span id="0-0">coreMath</span>\n</p>');
      parts = [[0, "coreMath"]];
      return expect(this.render(parts)).toBe(html);
    });
  });

}).call(this);
