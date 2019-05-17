import store from './store';

function zfill(src, count) {
  if (!store.settings.padWithZero) {
    return src;
  }

  let result = '';
  for (let i = 0; i < count - String(src).length; i++) {
    result += '0';
  }
  result += String(src);

  return result;
}

window.zfill = zfill;

export default {
  zero() {
    return {
      m: 0,
      s: 0,
      ms: 0,
    };
  },
  add(a, b) {
    if (!a) {
      a = this.zero();
    }
    if (!b) {
      b = this.zero();
    }

    let m = a.m + b.m;
    let s = a.s + b.s;
    let ms = a.ms + b.ms;
    while (ms >= 1000) {
      ms -= 1000;
      s++;
    }
    while (s >= 60) {
      s -= 60;
      m++;
    }

    return { m, s, ms };
  },
  sub(a, b) {
    if (!a) {
      a = this.zero();
    }
    if (!b) {
      b = this.zero();
    }

    let m = a.m - b.m;
    let s = a.s - b.s;
    let ms = a.ms - b.ms;
    while (s < 0) {
      m--;
      s += 60;
    }
    while (ms < 0) {
      s--;
      ms += 1000;
    }

    return { m, s, ms };
  },
  sort(a, b) {
    const gt = this.gt(a, b);
    if (gt) {
      return 1;
    }
    return -1;
  },
  gt(a, b) {
    if (a.m > b.m) {
      return true;
    } else if (b.m > a.m) {
      return false;
    }
    if (a.s > b.s) {
      return true;
    } else if (b.s > a.s) {
      return false;
    }
    if (a.ms > b.ms) {
      return true;
    } else if (b.ms > a.s) {
      return false;
    }
  },
  string(a) {
    if (!a) {
      return this.string(this.zero());
    }
    return `${zfill(a.m, 2)}:${zfill(a.s, 2)}:${zfill(a.ms, 3)}`;
  },
  cpstring(a) {
    if (!a) {
      return '0';
    }
    return a.s + a.m * 60 + a.ms / 1000;
  },
  parse(str) {
    if (!str.split) {
      return this.zero();
    }
    const parts = str.split(':');
    if (parts.length === 1) {
      return this.add({ m: 0, s: Number(str), ms: 0 }, this.zero());
    }
    if (parts.length !== 3) {
      return this.zero();
    }
    return this.add({
      m: Number(parts[0]),
      s: Number(parts[1]),
      ms: Number(parts[2]),
    }, this.zero());
  },
  isTime(str) {
    if (!str) {
      return false;
    }
    if (!str.split) {
      return false;
    }
    const parts = str.split(':');
    if (parts.length === 1) {
      return true;
    }
    if (parts.length !== 3) {
      return false;
    }
    return true;
  },
  min(a, b) {
    if (this.gt(a, b)) {
      return b;
    }
    return a;
  },
};