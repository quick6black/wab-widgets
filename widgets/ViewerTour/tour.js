/*
  Dojo Bootstrap Tour is a fork of Bootstrap Tour by sorich87. It replaces the jQuery dependency with Dojo and is an AMD-compatible Dojo module. It has been tested with Dojo Bootstrap by xsokev to remove the jQuery dependency.
  https://github.com/kyledodge/dojo-bootstrap-tour 
*/



define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/_base/window',
    'dojo/window',
    'dojo/query',
    'dojo/on',
    'dojo/dom',
    'dojo/dom-construct',
    'dojo/dom-attr',
    'dojo/dom-class',
    'dojo/dom-geometry',
    'Dojo-Bootstrap/Popover',
    'Dojo-Bootstrap/Tooltip'
],function (declare, lang, array, basewin, win, query, on, dom, domConstruct, domAttr, domClass, domGeom) {

    return declare(null, {
        _force: false,
        _inited: false,
        _handles: [],
        _keyboardHandles: [],
        storage: false,
        backdrop: {
            overlay: null,
            $element: null,
            $background: null,
            backgroundShown: false,
            overlayElementShown: false
        },
        defaultOptions: {
            name: 'demo',
            steps: [],
            container: 'body',
            autoscroll: false,
            keyboard: false,
            storage: this.storage,
            debug: true,
            backdrop: false,
            backdropPadding: 0,
            redirect: true,
            orphan: false,
            duration: false,
            delay: false,
            basePath: '',
            template: '<div class="popover" role="tooltip"> <div class="arrow"></div> <h3 class="popover-title"></h3> <div class="popover-content"></div> <div class="popover-navigation"> <div class="btn-group"> <button class="btn btn-sm btn-default" data-role="prev">&laquo; Prev</button> <button class="btn btn-sm btn-default" data-role="next">Next &raquo;</button> </div> <button class="btn btn-sm btn-default" data-role="end">End tour</button> </div> </div>',
            afterSetState: function (key, value) {},
            afterGetState: function (key, value) {},
            afterRemoveState: function (key) {},
            onStart: function (tour) {},
            onEnd: function (tour) {},
            onShow: function (tour) {},
            onShown: function (tour) {},
            onHide: function (tour) {},
            onHidden: function (tour) {},
            onNext: function (tour) {},
            onPrev: function (tour) {},
            onPause: function (tour, duration) {},
            onResume: function (tour, duration) {}
        },

        constructor: function(options) {
            try {
                this.storage = window.localStorage;
            } catch (_error) {
                this.storage = false;
            }

            this._options = lang.mixin(this.defaultOptions, options);
        },

        addSteps: function(steps) {
            var step, _i, _len;
            for (_i = 0, _len = steps.length; _i < _len; _i++) {
                step = steps[_i];
                this.addStep(step);
            }
        },

        addStep: function(step) {
            this._options.steps.push(step);
            return this;
        },

        getStep: function(i) {
            if (this._options.steps[i] != null) {
                return lang.mixin({
                    id: "step-" + i,
                    path: '',
                    placement: 'right',
                    title: '',
                    content: '<p></p>',
                    next: i === this._options.steps.length - 1 ? -1 : i + 1,
                    prev: i - 1,
                    animation: true,
                    container: this._options.container,
                    autoscroll: this._options.autoscroll,
                    backdrop: this._options.backdrop,
                    backdropPadding: this._options.backdropPadding,
                    redirect: this._options.redirect,
                    orphan: this._options.orphan,
                    duration: this._options.duration,
                    delay: this._options.delay,
                    template: this._options.template,
                    onShow: this._options.onShow,
                    onShown: this._options.onShown,
                    onHide: this._options.onHide,
                    onHidden: this._options.onHidden,
                    onNext: this._options.onNext,
                    onPrev: this._options.onPrev,
                    onPause: this._options.onPause,
                    onResume: this._options.onResume
                }, this._options.steps[i]);
            }
        },

        init: function(force) {
            array.forEach(this._handles, function(handle) {
                handle.remove();
            });
            array.forEach(this._keyboardHandles, function(handle) {
                handle.remove();
            });
            this._force = force;
            this.setCurrentStep();
            this._initMouseNavigation();
            this._initKeyboardNavigation();
            this._onResize(lang.hitch(this, function() {
                if (this._current !== null) {
                    this.showStep(this._current);
                }
            }));
            if (this._current !== null) {
                this.showStep(this._current);
            }
            this._inited = true;
            return this;
        },

        start: function(force) {
            var promise;
            if (force == null) {
                force = false;
            }
            if (!this._inited) {
                this.init(force);
            }

            if (this._current === null) {
                promise = this._makePromise(this._options.onStart != null ? this._options.onStart(this) : void 0);
                this._callOnPromiseDone(promise, this.showStep, 0);
                //FIXME - hack for now
                setTimeout(lang.hitch(this, function(){
                    this._scrollIntoView(this.getStep(0).element);
                }), 200);
            }
        },

        next: function() {
            var promise;
            promise = this.hideStep(this._current);
            return this._callOnPromiseDone(promise, this._showNextStep);
        },

        prev: function() {
            var promise;
            promise = this.hideStep(this._current);
            return this._callOnPromiseDone(promise, this._showPrevStep);
        },

        goTo: function(i) {
            var promise;
            promise = this.hideStep(this._current);
            return this._callOnPromiseDone(promise, this.showStep, i);
        },

        end: function() {
            var endHelper, promise;
            endHelper = (function(_this) {
                return function(e) {
                    array.forEach(this._handles, function(handle) {
                        handle.remove();
                    });
                    array.forEach(this._keyboardHandles, function(handle) {
                        handle.remove();
                    });

                    _this._setState('end', 'yes');
                    _this._inited = false;
                    _this._force = false;
                    _this._clearTimer();
                    if (_this._options.onEnd != null) {
                        return _this._options.onEnd(_this);
                    }
                };
            })(this);
            promise = this.hideStep(this._current);
            return this._callOnPromiseDone(promise, endHelper);
        },

        ended: function() {
            return !this._force && !!this._getState('end');
        },

        restart: function() {
            this._removeState('current_step');
            this._removeState('end');
            return this.start();
        },

        pause: function() {
            var step;
            step = this.getStep(this._current);
            if (!(step && step.duration)) {
                return this;
            }
            this._paused = true;
            this._duration -= new Date().getTime() - this._start;
            window.clearTimeout(this._timer);
            this._debug("Paused/Stopped step " + (this._current + 1) + " timer (" + this._duration + " remaining).");
            if (step.onPause != null) {
                return step.onPause(this, this._duration);
            }
        },

        resume: function() {
            var step;
            step = this.getStep(this._current);
            if (!(step && step.duration)) {
                return this;
            }
            this._paused = false;
            this._start = new Date().getTime();
            this._duration = this._duration || step.duration;
            this._timer = window.setTimeout((function(_this) {
                return function() {
                    if (_this._isLast()) {
                        return _this.next();
                    } else {
                        return _this.end();
                    }
                };
            })(this), this._duration);
            this._debug("Started step " + (this._current + 1) + " timer with duration " + this._duration);
            if ((step.onResume != null) && this._duration !== step.duration) {
                return step.onResume(this, this._duration);
            }
        },

        hideStep: function(i) {
            var hideStepHelper, promise, step;
            step = this.getStep(i);
            if (!step) {
                return;
            }
            this._clearTimer();
            promise = this._makePromise(step.onHide != null ? step.onHide(this, i) : void 0);
            hideStepHelper = (function(_this) {
                return function(e) {
                    var $element;
                    $element = query(step.element);
                    if (!($element.data('bs.popover') || $element.data('popover'))) {
                        $element = query('body');
                    }
                    $element.popover('destroy').removeClass("tour-" + _this._options.name + "-element tour-" + _this._options.name + "-" + i + "-element");
                    if (step.reflex) {
                        $element.removeClass('tour-step-element-reflex').off("" + (_this._reflexEvent(step.reflex)) + ".tour-" + _this._options.name);
                    }
                    if (step.backdrop) {
                        _this._hideBackdrop();
                    }
                    if (step.onHidden != null) {
                        return step.onHidden(_this);
                    }
                };
            })(this);
            this._callOnPromiseDone(promise, hideStepHelper);
            return promise;
        },

        showStep: function(i) {
            var promise, showStepHelper, skipToPrevious, step;
            step = this.getStep(i);
            if (!step) {
                return;
            }
            skipToPrevious = i < this._current;
            promise = this._makePromise(step.onShow != null ? step.onShow(this, i) : void 0);
            showStepHelper = (function(_this) {
                return function(e) {
                    var current_path, path, showPopoverAndOverlay;
                    _this.setCurrentStep(i);
                    path = (function() {
                        switch ({}.toString.call(step.path)) {
                            case '[object Function]':
                                return step.path();
                            case '[object String]':
                                return this._options.basePath + step.path;
                            default:
                                return step.path;
                        }
                    }).call(_this);
                    current_path = [document.location.pathname, document.location.hash].join('');
                    if (_this._isRedirect(path, current_path)) {
                        _this._redirect(step, path);
                        return;
                    }
                    if (_this._isOrphan(step)) {
                        if (!step.orphan) {
                            _this._debug("Skip the orphan step " + (_this._current + 1) + ".\nOrphan option is false and the element does not exist or is hidden.");
                            if (skipToPrevious) {
                                _this._showPrevStep();
                            } else {
                                _this._showNextStep();
                            }
                            return;
                        }
                        _this._debug("Show the orphan step " + (_this._current + 1) + ". Orphans option is true.");
                    }
                    if (step.backdrop) {
                        _this._showBackdrop(!_this._isOrphan(step) ? step.element : void 0);
                    }
                    showPopoverAndOverlay = function() {
                        if (_this.getCurrentStep() !== i) {
                            return;
                        }
                        if ((step.element != null) && step.backdrop) {
                            _this._showOverlayElement(step);
                        }
                        _this._showPopover(step, i);
                        if (step.onShown != null) {
                            step.onShown(_this);
                        }
                        return _this._debug("Step " + (_this._current + 1) + " of " + _this._options.steps.length);
                    };

                    if (step.autoscroll) {
                        _this._scrollIntoView(step.element, showPopoverAndOverlay);
                    } else {
                        showPopoverAndOverlay();
                    }
                    if (step.duration) {
                        return _this.resume();
                    }
                };
            })(this);
            if (step.delay) {
                this._debug("Wait " + step.delay + " milliseconds to show the step " + (this._current + 1));
                window.setTimeout((function(_this) {
                    return function() {
                        return _this._callOnPromiseDone(promise, showStepHelper);
                    };
                })(this), step.delay);
            } else {
                this._callOnPromiseDone(promise, showStepHelper);
            }
            return promise;
        },

        getCurrentStep: function() {
            return this._current;
        },

        setCurrentStep: function(value) {
            if (value != null) {
                this._current = value;
                this._setState('current_step', value);
            } else {
                this._current = this._getState('current_step');
                this._current = this._current === null ? null : parseInt(this._current, 10);
            }
            return this;
        },

        _setState: function(key, value) {
            var e, keyName;
            if (this._options.storage) {
                keyName = "" + this._options.name + "_" + key;
                try {
                    this._options.storage.setItem(keyName, value);
                } catch (_error) {
                    e = _error;
                    if (e.code === DOMException.QUOTA_EXCEEDED_ERR) {
                        this.debug('LocalStorage quota exceeded. State storage failed.');
                    }
                }
                return this._options.afterSetState(keyName, value);
            } else {
                if (this._state == null) {
                    this._state = {};
                }
                return this._state[key] = value;
            }
        },

        _removeState: function(key) {
            var keyName;
            if (this._options.storage) {
                keyName = "" + this._options.name + "_" + key;
                this._options.storage.removeItem(keyName);
                return this._options.afterRemoveState(keyName);
            } else {
                if (this._state != null) {
                    return delete this._state[key];
                }
            }
        },

        _getState: function(key) {
            var keyName, value;
            if (this._options.storage) {
                keyName = "" + this._options.name + "_" + key;
                value = this._options.storage.getItem(keyName);
            } else {
                if (this._state != null) {
                    value = this._state[key];
                }
            }
            if (value === void 0 || value === 'null') {
                value = null;
            }
            this._options.afterGetState(key, value);
            return value;
        },

        _showNextStep: function() {
            var promise, showNextStepHelper, step;
            step = this.getStep(this._current);
            showNextStepHelper = (function(_this) {
                return function(e) {
                    return _this.showStep(step.next);
                };
            })(this);
            promise = this._makePromise(step.onNext != null ? step.onNext(this) : void 0);
            return this._callOnPromiseDone(promise, showNextStepHelper);
        },

        _showPrevStep: function() {
            var promise, showPrevStepHelper, step;
            step = this.getStep(this._current);
            showPrevStepHelper = (function(_this) {
                return function(e) {
                    return _this.showStep(step.prev);
                };
            })(this);
            promise = this._makePromise(step.onPrev != null ? step.onPrev(this) : void 0);
            return this._callOnPromiseDone(promise, showPrevStepHelper);
        },

        _debug: function(text) {
            if (this._options.debug) {
                return window.console.log("Bootstrap Tour '" + this._options.name + "' | " + text);
            }
        },

        _isRedirect: function(path, currentPath) {
            return (path != null) && path !== '' && (({}.toString.call(path) === '[object RegExp]' && !path.test(currentPath)) || ({}.toString.call(path) === '[object String]' && path.replace(/\?.*$/, '').replace(/\/?$/, '') !== currentPath.replace(/\/?$/, '')));
        },

        _redirect: function(step, path) {
            if (lang.isFunction(step.redirect)) {
                return step.redirect.call(this, path);
            } else if (step.redirect === true) {
                this._debug("Redirect to " + path);
                return document.location.href = path;
            }
        },

        _isOrphan: function(step) {
            return (step.element == null) || !query(step.element).length || domClass.contains(query(step.element), ':hidden') && (query(step.element)[0].namespaceURI !== 'http://www.w3.org/2000/svg');
        },

        _isLast: function() {
            return this._current < this._options.steps.length - 1;
        },

        _showPopover: function(step, i) {
            var $element, $tip, isOrphan, options;
            domConstruct.destroy(query(".tour-" + this._options.name));
            options = this._options;
            isOrphan = this._isOrphan(step);
            step.template = this._template(step, i);

            if (isOrphan) {
                step.element = 'body';
                step.placement = 'top';
            }
            $element = query(step.element);
            $element.addClass("tour-" + this._options.name + "-element tour-" + this._options.name + "-" + i + "-element");
            if (step.options) {
                lang.extend(options, step.options);
            }
            if (step.reflex && !isOrphan) {
                $element.addClass('tour-step-element-reflex');
                $element.off("" + (this._reflexEvent(step.reflex)) + ".tour-" + this._options.name);
                $element.on("" + (this._reflexEvent(step.reflex)) + ".tour-" + this._options.name, (function(_this) {
                    return function() {
                        if (_this._isLast()) {
                            return _this.next();
                        } else {
                            return _this.end();
                        }
                    };
                })(this));
            }

            $element.popover({
                placement: step.placement,
                trigger: 'manual',
                title: step.title,
                content: step.content,
                html: true,
                animation: step.animation,
                selector: step.element,
                template: step.template.outerHTML
            }).popover('show');

            $tip = $element.data('bs.popover')[0] ? $element.data('bs.popover')[0].tip() : $element.data('popover')[0].tip();
            domAttr.set($tip, 'id', step.id);
            this._reposition($tip, step);
            if (isOrphan) {
                return this._center($tip);
            }
        },

        _template: function(step, i) {
            var $navigation, $next, $prev, $template;
            $template = lang.isFunction(step.template) ? step.template(i, step) : step.template;
            $template = domConstruct.toDom($template)
            $navigation = query('.popover-navigation', $template)[0];
            $content = query('.popover-content', $template)[0];
            $prev = query('[data-role=prev]', $navigation)[0];
            $next = query('[data-role=next]', $navigation)[0];

            if (this._isOrphan(step)) {
                domClass.add($template, 'orphan');
            }

            domClass.add($template, "tour-" + this._options.name + " tour-" + this._options.name + "-" + i);
            domAttr.set($content, "innerHTML", step.content);
            if (step.prev < 0) {
                domClass.add($prev, 'disabled');
            }

            if (step.next < 0) {
                domClass.add($next, 'disabled');
            }

            return $template;
        },

        _reflexEvent: function(reflex) {
            if ({}.toString.call(reflex) === '[object Boolean]') {
                return 'click';
            } else {
                return reflex;
            }
        },

        _reposition: function($tip, step) {
            var offsetBottom, offsetHeight, offsetRight, offsetWidth, originalLeft, originalTop, tipOffset;
            offsetWidth = $tip.offsetWidth;
            offsetHeight = $tip.offsetHeight;
            tipOffset = domGeom.position($tip);
            originalLeft = tipOffset.x;
            originalTop = tipOffset.y;

            if (step.placement === 'bottom' || step.placement === 'top') {
                if (originalLeft !== tipOffset.x) {
                    return this._replaceArrow($tip, (tipOffset.x - originalLeft) * 2, offsetWidth, 'left');
                }
            } else {
                if (originalTop !== tipOffset.y) {
                    return this._replaceArrow($tip, (tipOffset.y - originalTop) * 2, offsetHeight, 'top');
                }
            }
        },

        _center: function($tip) {
            return $tip.css('top', query(window).outerHeight() / 2 - $tip.outerHeight() / 2);
        },

        _replaceArrow: function($tip, delta, dimension, position) {
            return $tip.find('.arrow').css(position, delta ? 50 * (1 - delta / dimension) + '%' : '');
        },

        _scrollIntoView: function(element, callback) {
            var $element = query(element);
            if (!$element.length) {
                return callback();
            }

            win.scrollIntoView($element[0]);

            if(callback) {
                callback();
            }
        },

        _onResize: function(callback, timeout) {
            on(window, "resize", function() {
                clearTimeout(timeout);
                return timeout = setTimeout(callback, 100);
            });
        },

        _initMouseNavigation: function() {
            array.forEach(this._handles, function(handle) {
               handle.remove();
            });

            this._handles.push(
                on(document, on.selector(".tour-" + this._options.name + " [data-role='next']", "click"), lang.hitch(this, function(evt) {
                    evt.preventDefault();
                    return this.next();
                }))
            );

            this._handles.push(
                on(document, on.selector(".tour-" + this._options.name + " [data-role='prev']", "click"), lang.hitch(this, function(evt) {
                    evt.preventDefault();
                    return this.prev();
                }))
            );

            this._handles.push(
                on(document, on.selector(".tour-" + this._options.name + " [data-role='end']", "click"), lang.hitch(this, function(evt) {
                    evt.preventDefault();
                    return this.end();
                }))
            );
        },

        _initKeyboardNavigation: function() {
            if (!this._options.keyboard) {
                return;
            }

            this._keyboardHandles.push(
                on(document, "keyup", lang.hitch(this, function(e) {
                    if (!e.which) {
                        return;
                    }
                    switch (e.which) {
                        case 39:
                            e.preventDefault();
                            if (this._isLast()) {
                                return this.next();
                            }
                            break;
                        case 37:
                            e.preventDefault();
                            if (this._current > 0) {
                                return this.prev();
                            }
                            break;
                        case 27:
                            e.preventDefault();
                            return this.end();
                    }
                }))
            );
        },

        _makePromise: function(result) {
            if (result && lang.isFunction(result.then)) {
                return result;
            } else {
                return null;
            }
        },

        _callOnPromiseDone: function(promise, cb, arg) {
            if (promise) {
                return promise.then((function(_this) {
                    return function(e) {
                        return cb.call(_this, arg);
                    };
                })(this));
            } else {
                return cb.call(this, arg);
            }
        },

        _showBackdrop: function(element) {
            if (this.backdrop.backgroundShown) {
                return;
            }
            this.backdrop = domConstruct.toDom('<div class="tour-backdrop"></div>');
            this.backdrop.backgroundShown = true;
            domConstruct.place(this.backdrop, basewin.body(), "after");
        },

        _hideBackdrop: function() {
            this._hideOverlayElement();
            return this._hideBackground();
        },

        _hideBackground: function() {
            if (this.backdrop) {
                this.backdrop.remove();
                this.backdrop.overlay = null;
                return this.backdrop.backgroundShown = false;
            }
        },

        _showOverlayElement: function(step) {
            var $element, elementData;
            $element = query(step.element);
            if (!$element || $element.length === 0 || this.backdrop.overlayElementShown) {
                return;
            }
            this.backdrop.overlayElementShown = true;
            this.backdrop.$element = $element[0];
            domClass.add(this.backdrop.$element, 'tour-step-backdrop');
            this.backdrop.$background = domConstruct.toDom('<div class="tour-step-background"></div>');

            elementData = {
                width: domGeom.getContentBox($element[0]),
                height: domGeom.getContentBox($element[0]),
                offset: domGeom.position($element[0])
            };
            domConstruct.place(this.backdrop.$background, basewin.body(), "after");

            if (step.backdropPadding) {
                this._applyBackdropPadding(step.backdropPadding, elementData);
            }
        },

        _hideOverlayElement: function() {
            if (!this.backdrop.overlayElementShown) {
                return;
            }
            domClass.remove(this.backdrop.$element, 'tour-step-backdrop');
            domConstruct.destroy(this.backdrop.$background);
            this.backdrop.$element = null;
            this.backdrop.$background = null;
            return this.backdrop.overlayElementShown = false;
        },

        _applyBackdropPadding: function(padding, data) {
            if (typeof padding === 'object') {
                if (padding.top == null) {
                    padding.top = 0;
                }
                if (padding.right == null) {
                    padding.right = 0;
                }
                if (padding.bottom == null) {
                    padding.bottom = 0;
                }
                if (padding.left == null) {
                    padding.left = 0;
                }
                data.offset.top = data.offset.top - padding.top;
                data.offset.left = data.offset.left - padding.left;
                data.width = data.width + padding.left + padding.right;
                data.height = data.height + padding.top + padding.bottom;
            } else {
                data.offset.top = data.offset.top - padding;
                data.offset.left = data.offset.left - padding;
                data.width = data.width + (padding * 2);
                data.height = data.height + (padding * 2);
            }
            return data;
        },

        _clearTimer: function() {
            window.clearTimeout(this._timer);
            this._timer = null;
            return this._duration = null;
        }
    });
});