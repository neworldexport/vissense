/*global VisSense,$,jasmine,describe,it,expect*/
/**
 * @license
 * Vissense <http://vissense.com/>
 * Copyright 2014 tbk <theborakompanioni+vissense@gmail.com>
 * Available under MIT license <http://opensource.org/licenses/MIT>
 */
describe('VisSense', function () {
  'use strict';

    it('should throw error when not initialized with element node', function () {
      expect(function () {
        return new VisSense();
      }).toThrow(new Error('not an element node'));
    });

    it('should create VisSense objects', function () {
      jasmine.getFixtures().set('<div id="element" style="width: 1px; height: 1px;"></div>');
      var visobj = new VisSense($('#element')[0]);
      var visobj3 = VisSense.of($('#element')[0]);
      /* jshint newcap:false */
      var visobj2 = VisSense($('#element')[0], {
        fullyvisible: 0.75
      });

      expect(visobj).toBeDefined();
      expect(visobj2).toBeDefined();
      expect(visobj3).toBeDefined();
    });

    it('should check the default values', function () {
      jasmine.getFixtures().set('<div id="element" style="width: 1px; height: 1px;"></div>');

      var visobj = VisSense.of($('#element')[0], {});

      expect(visobj._config.fullyvisible).toBe(1);
      expect(visobj._config.hidden).toBe(0);
    });

    it('should adopt config arguments properly', function () {
      jasmine.getFixtures().set('<div id="element" style="width: 1px; height: 1px;"></div>');

      var visobj = VisSense.of($('#element')[0], {
        fullyvisible: 0.75
      });

      expect(visobj._config.fullyvisible).toBe(0.75);
      expect(visobj._config.hidden).toBe(0);
    });

    it('should create and test for a hidden object', function () {
      jasmine.getFixtures().set('<div id="element" style="width: 0; height: 0;"></div>');
      var visobj = new VisSense($('#element')[0]);

      expect(visobj.isHidden()).toBe(true);
      expect(visobj.isVisible()).toBe(false);
      expect(visobj.isFullyVisible()).toBe(false);
      expect(visobj.percentage()).toBe(0);
    });

    it('should create and test for a visible object', function () {
      jasmine.getFixtures().set('<div id="element" style="width: 2px; height: 2px; position: fixed; top:-1px; left: -1px;"></div>');
      var visobj = new VisSense($('#element')[0]);

      expect(visobj.isHidden()).toBe(false);
      expect(visobj.isVisible()).toBe(true);
      expect(visobj.isFullyVisible()).toBe(false);
      expect(visobj.percentage()).toBe(0.25);
    });

    it('should create and test for a fully visible object', function () {
      jasmine.getFixtures().set('<div id="element" style="position:fixed; top:0; right:0; bottom:0; left:0;"></div>');
      var visobj = new VisSense($('#element')[0]);

      expect(visobj.isHidden()).toBe(false);
      expect(visobj.isVisible()).toBe(true);
      expect(visobj.isFullyVisible()).toBe(true);
      expect(visobj.percentage()).toBe(1);
    });

    it('should detect an element streching the whole viewport as fully visible', function () {
      var viewport = VisSense.Utils._viewport();

      jasmine.getFixtures().set('<div id="element" ' +
      'style="top:0; left:0; position: fixed; width: ' + viewport.width + 'px; height: ' + viewport.height + 'px"></div>');

      var visobj = new VisSense($('#element')[0]);

      expect(visobj.isFullyVisible()).toBe(true);
      expect(visobj.percentage()).toEqual(1);
    });

    it('should detect element with 50% visibility as fully visible', function () {
      jasmine.getFixtures().load('visible_50_percent_top.html');

      var visobj = new VisSense($('#element')[0], {
        fullyvisible: 0.4
      });

      expect(visobj.isHidden()).toBe(false);
      expect(visobj.isVisible()).toBe(true);
      expect(visobj.isFullyVisible()).toBe(true);
      expect(visobj.percentage()).toEqual(0.5);
    });

    it('should detect element with 50% visibility as hidden (config)', function () {
      jasmine.getFixtures().load('visible_50_percent_top.html');

      var visobj = new VisSense($('#element')[0], {
        hidden: 0.6
      });

      expect(visobj.isHidden()).toBe(true);
      expect(visobj.isVisible()).toBe(false);
      expect(visobj.isFullyVisible()).toBe(false);
      expect(visobj.percentage()).toEqual(0.5);
    });

    it('should be possible to specify an alternative logic to get the visible percentage', function () {
      jasmine.getFixtures().load('visible_50_percent_top.html');

      // a function that alternates the percentage on each call
      var alternativeVisiblePercentage = (function() {
        var i = 0;
        return function(/*jshint unused:false*/element) {
          return i++ % 2 === 0 ? 0 : 1;
        };
      })();

      var visobj = new VisSense($('#element')[0], {
        percentageHook: alternativeVisiblePercentage
      });

      expect(visobj.isHidden()).toBe(true);
      expect(visobj.isHidden()).toBe(false);
      expect(visobj.isHidden()).toBe(true);
      expect(visobj.isHidden()).toBe(false);
      expect(visobj.isHidden()).toBe(true);
      expect(visobj.isHidden()).toBe(false);

    });


  it('should be possible to specify further requirements for an element to be visible', function () {
    jasmine.getFixtures().load('visible_50_percent_top.html');

    var alternativeVisibility = (function() {
      var i = 0;
      return function(/*jshint unused:false*/element) {
        return i++ % 3 === 0 ? true : false;
      };
    })();

    var visobj = new VisSense($('#element')[0], {
      visibilityHooks: [alternativeVisibility]
    });

    expect(visobj.isVisible()).toBe(true); // i = 0
    expect(visobj.isVisible()).toBe(false);
    expect(visobj.isVisible()).toBe(false);
    expect(visobj.isVisible()).toBe(true);
    expect(visobj.isVisible()).toBe(false);
    expect(visobj.isVisible()).toBe(false);
    expect(visobj.isVisible()).toBe(true);

  });
});
