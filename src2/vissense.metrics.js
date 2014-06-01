/**
 * @license
 * Vissense <http://vissense.com/>
 * Copyright 2014 tbk <theborakompanioni+vissense@gmail.com>
 * Available under MIT license <http://opensource.org/licenses/MIT>
 */
/**
 * depends on ['vissense.core', 'vissense.utils', 'vissense.monitor', 'vissense.timer', 'vissense.stopwatch']
 */
 ;(function(window, VisSense, VisSenseUtils, brwsrfyMetrics) {
    if(!brwsrfyMetrics) {
        throw new Error('global Metrics is not available');
    }
    if(!VisSense || !VisSense.monitor || !VisSense.timer || !VisSenseUtils.newStopWatch) {
        throw new Error('VisSense is not available');
    }

    /** Used as a safe reference for `undefined` in pre ES5 environments */
    var undefined;

    /** Used as a reference to the global object */
    var root = (typeof window === 'object' && window) || this;

    var parseConfig = function(config) {
        var c = {
            visibleUpdateInterval: 250,
            hiddenUpdateInterval: 250
        };

        if(!!config) {
            if(config.visibleUpdateInterval > 0) {
                c.visibleUpdateInterval = config.visibleUpdateInterval;
            }

            if(config.hiddenUpdateInterval > 0) {
                c.hiddenUpdateInterval = config.hiddenUpdateInterval;
            }
        }

        return c;
    };

    /*--------------------------------------------------------------------------*/


    function VisMetrics(vistimer, inConfig) {
        //VisSense.call(this, element, config);
        var self = this;
        var stopped = false;
        var timerIds = [];
        var config = parseConfig(inConfig);
        var report = new brwsrfyMetrics.Report();

        var watchVisible = VisSenseUtils.newStopWatch();
        var watchFullyVisible = VisSenseUtils.newStopWatch();
        var watchHidden = VisSenseUtils.newStopWatch();
        var watchDuration = VisSenseUtils.newStopWatch();

        report.addMetric('time.visible', new brwsrfyMetrics.Counter());
        report.addMetric('time.fullyvisible', new brwsrfyMetrics.Counter());
        report.addMetric('time.hidden', new brwsrfyMetrics.Counter());
        report.addMetric('time.relativeVisible', new brwsrfyMetrics.Counter());
        report.addMetric('time.duration', new brwsrfyMetrics.Counter());
        report.addMetric('visibility.changes', new brwsrfyMetrics.Timer());
        report.addMetric('percentage', new brwsrfyMetrics.Timer());
        //self.report.addMetric('ns.histogram', new brwsrfyMetrics.Histogram.createUniformHistogram(10));
        //self.report.addMetric('ns.exphistogram', new brwsrfyMetrics.Histogram.createExponentialDecayHistogram(10, 0.1));


        updatePercentage();

        updateVisibilityChanges();

        vistimer.vismon().onVisibilityPercentageChange(function() {
            if(stopped) {
                return;
            }

            updatePercentage();
            stopAndUpdateTimers(vistimer.vismon());
        });

        vistimer.vismon().onVisibilityChange(function() {
            if(stopped) {
                return;
            }

            updateVisibilityChanges();
        });

        vistimer.every(config.visibleUpdateInterval, config.hiddenUpdateInterval, function() {
            if(stopped) {
                return;
            }

            updatePercentage();
            stopAndUpdateTimers(vistimer.vismon());
        });

        this.getMetric = function(name) {
            return report.getMetric(name);
        };

        this.summary = function() {
            return report.summary();
        };

        this.stopped = function() {
            return stopped;
        };

        this.stop = function() {
            updatePercentage();
            stopAndUpdateTimers(vistimer.vismon());

            vistimer.stopAll();
            return stopped = true;
        };

        function updatePercentage() {
            var percentage = vistimer.vismon().status().percentage();
            report.getMetric('percentage').update(percentage);
        }

        function updateVisibilityChanges() {
            var state = vistimer.vismon().status().state();

            report.getMetric('visibility.changes').update(state);
        }

        function fireIfPositive(value, callback) {
            if(value > 0) {
                callback(value);
            }
        }

        function stopAndUpdateTimers(vismon) {
            var status = vismon.status();
            var timeVisible = watchVisible.stopAndThenRestartIf(status.isVisible());

            fireIfPositive(timeVisible, function(value) {
                report.getMetric('time.visible').inc(value);
                report.getMetric('time.relativeVisible').inc(value * status.percentage());
            });

            fireIfPositive(watchFullyVisible.stopAndThenRestartIf(status.isFullyVisible()), function(value) {
                report.getMetric('time.fullyvisible').inc(value);
            });
            fireIfPositive(watchHidden.stopAndThenRestartIf(status.isHidden()), function(value) {
                report.getMetric('time.hidden').inc(value);
            });
            fireIfPositive(watchDuration.restart(), function(value) {
                report.getMetric('time.duration').inc(value);
            });
        }
    }

    function newVisMetrics(vissense, config) {
        return new VisMetrics(vissense.timer(), config);
    }

    VisSense.metrics = newVisMetrics;
    VisSense.prototype.metrics = function(config) {
        return newVisMetrics(this, config);
    };


}.call(this, this, this.VisSense, this.VisSenseUtils, this.brwsrfyMetrics));