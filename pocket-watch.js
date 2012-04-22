function Suite() {
  this.benchmarks = [];
}

Suite.prototype.add = function(label, fn) {
  this.benchmarks.push({ 'label': label, 'fn': fn });
  return this;
};

Suite.prototype.once = function(limit) {
  if (limit == null) limit = 500;

  var i, j, duration, fn, start, elapsed,
      calibrated = false,
      last = false,
      cycles = 0,
      total = 0,
      times = [],
      iterations = 1;

  for (i = 0; i < this.benchmarks.length; i++) {
    times[i] = 0;
  }

  while (true) {
    duration = 0;

    for (i = 0; i < this.benchmarks.length; i++) {
      fn = this.benchmarks[i].fn;
      start = +new Date();

      for (j = 0; j < iterations; j++) {
        fn();
      }

      elapsed = +new Date() - start;
      duration += elapsed;

      if (calibrated) {
        times[i] += elapsed;
        total += elapsed;
      }
    }

    if (last) { break; }

    if (calibrated) {
      cycles += 1;
    } else {
      if (duration < limit * 0.025) {
        iterations *= 2;
      } else {
        calibrated = true;
      }
    }

    if (total + duration > limit) {
      iterations = Math.round((limit - total) * (iterations / duration));
      last = true;
    }
  }

  return times;
};

Suite.prototype.batch = function(cycles, limit) {
  if (cycles == null) cycles = 5;

  var i, t, times = [];

  for (i = 0; i < this.benchmarks.length; i++) {
    times.push([]);
  }

  while (cycles-- > 0) {
    t = this.once(limit);
    for (i = 0; i < this.benchmarks.length; i++) {
      times[i].push(t[i]);
    }
  }

  return times;
};

function create() {
  return new Suite();
}

module.exports = create;
