/**
 * @author arodic / https://github.com/arodic
 */

import {PointerEvents} from "../lib/PointerEvents.js";
import {Helper} from "./Helper.js";

// TODO: documentation
/*
 * onKeyDown, onKeyUp require domElement to be focused (set tabindex attribute)
 */

// TODO: implement dom element swap and multiple dom elements
export const InteractiveMixin = (superclass) => class extends superclass {
	get isInteractive() { return true; }
	constructor(props) {
		super(props);

		this.defineProperties({
			enabled: true,
			_pointerEvents: new PointerEvents(props.domElement, {normalized: true})
		});

		this.onPointerDown = this.onPointerDown.bind(this);
		this.onPointerHover = this.onPointerHover.bind(this);
		this.onPointerMove = this.onPointerMove.bind(this);
		this.onPointerUp = this.onPointerUp.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.onKeyUp = this.onKeyUp.bind(this);
		this.onWheel = this.onWheel.bind(this);
		this.onContextmenu = this.onContextmenu.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);

		this._addEvents();
	}
	dispose() {
		this._removeEvents();
		this._pointerEvents.dispose();
	}
	_addEvents() {
		if (this._listening) return;
		this._pointerEvents.addEventListener('pointerdown', this.onPointerDown);
		this._pointerEvents.addEventListener('pointerhover', this.onPointerHover);
		this._pointerEvents.addEventListener('pointermove', this.onPointerMove);
		this._pointerEvents.addEventListener('pointerup', this.onPointerUp);
		this._pointerEvents.addEventListener('keydown', this.onKeyDown);
		this._pointerEvents.addEventListener('keyup', this.onKeyUp);
		this._pointerEvents.addEventListener('wheel', this.onWheel);
		this._pointerEvents.addEventListener('contextmenu', this.onContextmenu);
		this._pointerEvents.addEventListener('focus', this.onFocus);
		this._pointerEvents.addEventListener('blur', this.onBlur);
		this._listening = true;
	}
	_removeEvents() {
		if (!this._listening) return;
		this._pointerEvents.removeEventListener('pointerdown', this.onPointerDown);
		this._pointerEvents.removeEventListener('pointerhover', this.onPointerHover);
		this._pointerEvents.removeEventListener('pointermove', this.onPointerMove);
		this._pointerEvents.removeEventListener('pointerup', this.onPointerUp);
		this._pointerEvents.removeEventListener('keydown', this.onKeyDown);
		this._pointerEvents.removeEventListener('keyup', this.onKeyUp);
		this._pointerEvents.removeEventListener('wheel', this.onWheel);
		this._pointerEvents.removeEventListener('contextmenu', this.onContextmenu);
		this._pointerEvents.removeEventListener('focus', this.onFocus);
		this._pointerEvents.removeEventListener('blur', this.onBlur);
		this._listening = false;
	}
	enabledChanged(value) {
		value ? this._addEvents() : this._removeEvents();
	}
	// Control methods. Implement in subclass!
	onContextmenu() {} // event
	onPointerHover() {} // pointer
	onPointerDown() {} // pointer
	onPointerMove() {} // pointer
	onPointerUp() {} // pointer
	onPointerLeave() {} // pointer
	onKeyDown() {} // event
	onKeyUp() {} // event
	onWheel() {} // event
	onFocus() {} // event
	onBlur() {} // event
};

export class Interactive extends InteractiveMixin(Helper) {}
