import { Object3D, Vector3, Quaternion, Vector2, BufferGeometry, BufferAttribute, UniformsUtils, Color, DoubleSide, ShaderMaterial, Mesh, Euler, Matrix4, Uint16BufferAttribute, Float32BufferAttribute, SphereBufferGeometry, CylinderBufferGeometry, OctahedronBufferGeometry, BoxBufferGeometry, TorusBufferGeometry, Line, Raycaster } from '../../../three.js/build/three.module.js';

/**
 * @author arodic / https://github.com/arodic
 *
 * This class provides events and related interfaces for handling hardware
 * agnostic pointer input from mouse, touchscreen and keyboard.
 * It is inspired by PointerEvents https://www.w3.org/TR/pointerevents/
 *
 * Please report bugs at https://github.com/arodic/PointerEvents/issues
 *
 * @event contextmenu
 * @event keydown - requires focus
 * @event keyup - requires focus
 * @event wheel
 * @event focus
 * @event blur
 * @event pointerdown
 * @event pointermove
 * @event pointerhover
 * @event pointerup
 */

class PointerEvents {

	constructor( domElement, params = {} ) {

		this.domElement = domElement;
		this.pointers = new PointerArray( domElement, params.normalized );

		const scope = this;
		let dragging = false;

		function _onContextmenu( event ) {

			event.preventDefault();
			scope.dispatchEvent( { type: "contextmenu" } );

		}

		function _onMouseDown( event ) {

			event.preventDefault();
			if ( ! dragging ) {

				dragging = true;
				domElement.removeEventListener( "mousemove", _onMouseHover, false );
				document.addEventListener( "mousemove", _onMouseMove, false );
				document.addEventListener( "mouseup", _onMouseUp, false );
				scope.domElement.focus();
				scope.pointers.update( event, "pointerdown" );
				scope.dispatchEvent( makePointerEvent( "pointerdown", scope.pointers ) );

			}

		}
		function _onMouseMove( event ) {

			event.preventDefault();
			scope.pointers.update( event, "pointermove" );
			scope.dispatchEvent( makePointerEvent( "pointermove", scope.pointers ) );

		}
		function _onMouseHover( event ) {

			scope.pointers.update( event, "pointerhover" );
			// TODO: UNHACK!
			scope.pointers[ 0 ].start.copy( scope.pointers[ 0 ].position );
			scope.dispatchEvent( makePointerEvent( "pointerhover", scope.pointers ) );

		}
		function _onMouseUp( event ) {

			event.preventDefault();
			if ( event.buttons === 0 ) {

				dragging = false;
				domElement.addEventListener( "mousemove", _onMouseHover, false );
				document.removeEventListener( "mousemove", _onMouseMove, false );
				document.removeEventListener( "mouseup", _onMouseUp, false );
				scope.pointers.update( event, "pointerup", true );
				scope.dispatchEvent( makePointerEvent( "pointerup", scope.pointers ) );

			}

		}

		function _onTouchDown( event ) {

			event.preventDefault();
			scope.domElement.focus();
			scope.pointers.update( event, "pointerdown" );
			scope.dispatchEvent( makePointerEvent( "pointerdown", scope.pointers ) );

		}
		function _onTouchMove( event ) {

			event.preventDefault();
			scope.pointers.update( event, "pointermove" );
			scope.dispatchEvent( makePointerEvent( "pointermove", scope.pointers ) );

		}
		function _onTouchHover( event ) {

			scope.pointers.update( event, "pointerhover" );
			scope.dispatchEvent( makePointerEvent( "pointerhover", scope.pointers ) );

		}
		function _onTouchUp( event ) {

			scope.pointers.update( event, "pointerup" );
			scope.dispatchEvent( makePointerEvent( "pointerup", scope.pointers ) );

		}

		function _onKeyDown( event ) {

			scope.dispatchEvent( { type: "keydown", keyCode: event.keyCode } );

		}
		function _onKeyUp( event ) {

			scope.dispatchEvent( { type: "keyup", keyCode: event.keyCode } );

		}

		function _onWheel( event ) {

			event.preventDefault();
			// TODO: test on multiple platforms/browsers
			// Normalize deltaY due to https://bugzilla.mozilla.org/show_bug.cgi?id=1392460
			const delta = event.deltaY > 0 ? 1 : - 1;
			scope.dispatchEvent( { type: "wheel", delta: delta } );

		}

		function _onFocus() {

			domElement.addEventListener( "blur", _onBlur, false );
			scope.dispatchEvent( { type: "focus" } );

		}
		function _onBlur() {

			domElement.removeEventListener( "blur", _onBlur, false );
			scope.dispatchEvent( { type: "blur" } );

		}

		{

			domElement.addEventListener( "contextmenu", _onContextmenu, false );
			domElement.addEventListener( "mousedown", _onMouseDown, false );
			domElement.addEventListener( "mousemove", _onMouseHover, false );
			domElement.addEventListener( "touchstart", _onTouchHover, false );
			domElement.addEventListener( "touchstart", _onTouchDown, false );
			domElement.addEventListener( "touchmove", _onTouchMove, false );
			domElement.addEventListener( "touchend", _onTouchUp, false );
			domElement.addEventListener( "keydown", _onKeyDown, false );
			domElement.addEventListener( "keyup", _onKeyUp, false );
			domElement.addEventListener( "wheel", _onWheel, false );
			domElement.addEventListener( "focus", _onFocus, false );

		}

		this.dispose = function () {

			domElement.removeEventListener( "contextmenu", _onContextmenu, false );
			domElement.removeEventListener( "mousedown", _onMouseDown, false );
			domElement.removeEventListener( "mousemove", _onMouseHover, false );
			document.removeEventListener( "mousemove", _onMouseMove, false );
			document.removeEventListener( "mouseup", _onMouseUp, false );
			domElement.removeEventListener( "touchstart", _onTouchHover, false );
			domElement.removeEventListener( "touchstart", _onTouchDown, false );
			domElement.removeEventListener( "touchmove", _onTouchMove, false );
			domElement.removeEventListener( "touchend", _onTouchUp, false );
			domElement.removeEventListener( "keydown", _onKeyDown, false );
			domElement.removeEventListener( "keyup", _onKeyUp, false );
			domElement.removeEventListener( "wheel", _onWheel, false );
			domElement.removeEventListener( "focus", _onFocus, false );
			domElement.removeEventListener( "blur", _onBlur, false );
			delete this._listeners;

		};

	}
	addEventListener( type, listener ) {

		this._listeners = this._listeners || {};
		this._listeners[ type ] = this._listeners[ type ] || [];
		if ( this._listeners[ type ].indexOf( listener ) === - 1 ) {

			this._listeners[ type ].push( listener );

		}

	}
	hasEventListener( type, listener ) {

		if ( this._listeners === undefined ) return false;
		return this._listeners[ type ] !== undefined && this._listeners[ type ].indexOf( listener ) !== - 1;

	}
	removeEventListener( type, listener ) {

		if ( this._listeners === undefined ) return;
		if ( this._listeners[ type ] !== undefined ) {

			let index = this._listeners[ type ].indexOf( listener );
			if ( index !== - 1 ) this._listeners[ type ].splice( index, 1 );

		}

	}
	dispatchEvent( event ) {

		if ( this._listeners === undefined ) return;
		if ( this._listeners[ event.type ] !== undefined ) {

			// event.target = this; // TODO: consider adding target!
			let array = this._listeners[ event.type ].slice( 0 );
			for ( let i = 0, l = array.length; i < l; i ++ ) {

				array[ i ].call( this, event );

			}

		}

	}

}

class Pointer {

	constructor( pointerID, target, type, pointerType ) {

		this.pointerID = pointerID;
		this.target = target;
		this.type = type;
		this.pointerType = pointerType;
		this.position = new Vector2$1();
		this.previous = new Vector2$1();
		this.start = new Vector2$1();
		this.movement = new Vector2$1();
		this.distance = new Vector2$1();
		this.button = - 1;
		this.buttons = 0;

	}
	update( previous ) {

		this.pointerID = previous.pointerID;
		this.previous.copy( previous.position );
		this.start.copy( previous.start );
		this.movement.copy( this.position ).sub( previous.position );
		this.distance.copy( this.position ).sub( this.start );

	}

}

class PointerArray extends Array {

	constructor( target, normalized ) {

		super();
		this.normalized = normalized || false;
		this.target = target;
		this.previous = [];
		this.removed = [];

	}
	update( event, type, remove ) {

		this.previous.length = 0;
		this.removed.length = 0;

		for ( let i = 0; i < this.length; i ++ ) {

			this.previous.push( this[ i ] );

		}
		this.length = 0;

		const rect = this.target.getBoundingClientRect();

		let touches = event.touches ? event.touches : [ event ];
		let pointerType = event.touches ? 'touch' : 'mouse';
		let buttons = event.buttons || 1;

		let id = 0;
		if ( ! remove ) for ( let i = 0; i < touches.length; i ++ ) {

			if ( isTouchInTarget( touches[ i ], this.target ) || event.touches === undefined ) {

				let pointer = new Pointer( id, this.target, type, pointerType );
				pointer.position.x = touches[ i ].clientX - rect.x;
				pointer.position.y = touches[ i ].clientY - rect.y;
				if ( this.normalized ) {

					const rect = this.target.getBoundingClientRect();
					pointer.position.x = ( pointer.position.x - rect.left ) / rect.width * 2.0 - 1.0;
					pointer.position.y = ( pointer.position.y - rect.top ) / rect.height * - 2.0 + 1.0;

				}
				pointer.previous.copy( pointer.position );
				pointer.start.copy( pointer.position );
				pointer.buttons = buttons;
				pointer.button = - 1;
				if ( buttons === 1 || buttons === 3 || buttons === 5 || buttons === 7 ) pointer.button = 0;
				else if ( buttons === 2 || buttons === 6 ) pointer.button = 1;
				else if ( buttons === 4 ) pointer.button = 2;
				pointer.altKey = event.altKey;
				pointer.ctrlKey = event.ctrlKey;
				pointer.metaKey = event.metaKey;
				pointer.shiftKey = event.shiftKey;
				this.push( pointer );
				id ++;

			}

		}

		if ( ! remove ) for ( let i = 0; i < this.length; i ++ ) {

			if ( this.previous.length ) {

				let closest = getClosest( this[ i ], this.previous );
				if ( getClosest( closest, this ) !== this[ i ] ) closest = null;
				if ( closest ) {

					this[ i ].update( closest );
					this.previous.splice( this.previous.indexOf( closest ), 1 );

				}

			}

		}

		for ( let i = this.previous.length; i --; ) {

			this.removed.push( this.previous[ i ] );
			this.previous.splice( i, 1 );

		}

	}

}

function makePointerEvent( type, pointers ) {

	const event = Object.assign( { type: type }, pointers );
	event.length = pointers.length;
	return event;

}

function isTouchInTarget( event, target ) {

	let eventTarget = event.target;
	while ( eventTarget ) {

		if ( eventTarget === target ) return true;
		eventTarget = eventTarget.parentElement;

	}
	return false;

}


function getClosest( pointer, pointers ) {

	let closestDist = Infinity;
	let closest;
	for ( let i = 0; i < pointers.length; i ++ ) {

		let dist = pointer.position.distanceTo( pointers[ i ].position );
		if ( dist < closestDist ) {

			closest = pointers[ i ];
			closestDist = dist;

		}

	}
	return closest;

}

class Vector2$1 {

	constructor( x, y ) {

		this.x = x;
		this.y = y;

	}
	copy( v ) {

		this.x = v.x;
		this.y = v.y;
		return this;

	}
	add( v ) {

		this.x += v.x;
		this.y += v.y;
		return this;

	}
	sub( v ) {

		this.x -= v.x;
		this.y -= v.y;
		return this;

	}
	length() {

		return Math.sqrt( this.x * this.x + this.y * this.y );

	}
	distanceTo( v ) {

		const dx = this.x - v.x;
		const dy = this.y - v.y;
		return Math.sqrt( dx * dx + dy * dy );

	}

}

/**
 * @author arodic / https://github.com/arodic
 *
 * Minimal implementation of io mixin: https://github.com/arodic/io
 * Includes event listener/dispatcher and defineProperties() method.
 * Changed properties trigger "changed" and "[prop]-changed" events as well as
 * execution of [prop]Changed() funciton if defined.
 */

const IoLiteMixin = ( superclass ) => class extends superclass {

	addEventListener( type, listener ) {

		this._listeners = this._listeners || {};
		this._listeners[ type ] = this._listeners[ type ] || [];
		if ( this._listeners[ type ].indexOf( listener ) === - 1 ) {

			this._listeners[ type ].push( listener );

		}

	}
	hasEventListener( type, listener ) {

		if ( this._listeners === undefined ) return false;
		return this._listeners[ type ] !== undefined && this._listeners[ type ].indexOf( listener ) !== - 1;

	}
	removeEventListener( type, listener ) {

		if ( this._listeners === undefined ) return;
		if ( this._listeners[ type ] !== undefined ) {

			let index = this._listeners[ type ].indexOf( listener );
			if ( index !== - 1 ) this._listeners[ type ].splice( index, 1 );

		}

	}
	dispatchEvent( event ) {

		if ( this._listeners === undefined ) return;
		if ( this._listeners[ event.type ] !== undefined ) {

			event.target = this;
			let array = this._listeners[ event.type ].slice( 0 );
			for ( let i = 0, l = array.length; i < l; i ++ ) {

				array[ i ].call( this, event );

			}

		}

	}
	// Define properties in builk.
	defineProperties( props ) {

		//Define store for properties.
		if ( ! this.hasOwnProperty( '_properties' ) ) {

			Object.defineProperty( this, '_properties', {
				value: {},
				enumerable: false
			} );

		}
		for ( let prop in props ) {

			defineProperty( this, prop, props[ prop ] );

		}

	}

};

// Defines getter, setter
const defineProperty = function ( scope, propName, defaultValue ) {

	scope._properties[ propName ] = defaultValue;
	if ( defaultValue === undefined ) {

		console.warn( 'IoLiteMixin: ' + propName + ' is mandatory!' );

	}
	Object.defineProperty( scope, propName, {
		get: function () {

			return scope._properties[ propName ] !== undefined ? scope._properties[ propName ] : defaultValue;

		},
		set: function ( value ) {

			if ( scope._properties[ propName ] !== value ) {

				const oldValue = scope._properties[ propName ];
				scope._properties[ propName ] = value;
				if ( typeof scope[ propName + 'Changed' ] === 'function' ) scope[ propName + 'Changed' ]( value, oldValue );
				scope.dispatchEvent( { type: propName + '-changed', value: value, oldValue: oldValue } );
				scope.dispatchEvent( { type: 'change', prop: propName, value: value, oldValue: oldValue } );

			}

		},
		enumerable: propName.charAt( 0 ) !== '_'
	} );
	scope[ propName ] = defaultValue;

};

/**
 * @author arodic / https://github.com/arodic
 */

/*
 * Helper is a variant of Object3D which automatically follows its target object.
 * On matrix update, it automatically copies transform matrices from its target Object3D.
 */

class Helper extends IoLiteMixin( Object3D ) {

	get isHelper() {

		return true;

	}
	constructor( params = {} ) {

		super();

		this.defineProperties( {
			object: params.object || null,
			camera: params.camera || null,
			space: 'local',
			size: 0,
			worldPosition: new Vector3(),
			worldQuaternion: new Quaternion(),
			worldScale: new Vector3(),
			cameraPosition: new Vector3(),
			cameraQuaternion: new Quaternion(),
			cameraScale: new Vector3(),
			eye: new Vector3()
		} );

	}
	updateHelperMatrix() {

		if ( this.object ) {

			this.object.updateMatrixWorld();
			this.matrix.copy( this.object.matrix );
			this.matrixWorld.copy( this.object.matrixWorld );

		} else {

			super.updateMatrixWorld();

		}

		this.matrixWorld.decompose( this.worldPosition, this.worldQuaternion, this.worldScale );

		let eyeDistance = 1;
		if ( this.camera ) {

			this.camera.updateMatrixWorld();
			this.camera.matrixWorld.decompose( this.cameraPosition, this.cameraQuaternion, this.cameraScale );
			if ( this.camera.isPerspectiveCamera ) {

				this.eye.copy( this.cameraPosition ).sub( this.worldPosition );
				eyeDistance = this.eye.length();
				this.eye.normalize();

			} else if ( this.camera.isOrthographicCamera ) {

				this.eye.copy( this.cameraPosition ).normalize();

			}

		}

		if ( this.size || this.space == 'world' ) {

			if ( this.size ) this.worldScale.set( 1, 1, 1 ).multiplyScalar( eyeDistance * this.size );
			if ( this.space === 'world' ) this.worldQuaternion.set( 0, 0, 0, 1 );
			this.matrixWorld.compose( this.worldPosition, this.worldQuaternion, this.worldScale );

		}

	}
	updateMatrixWorld() {

		this.updateHelperMatrix();
		this.matrixWorldNeedsUpdate = false;
		const children = this.children;
		for ( let i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].updateMatrixWorld( true );

		}

	}

}

/**
 * @author arodic / https://github.com/arodic
 */

// TODO: documentation
/*
 * onKeyDown, onKeyUp require domElement to be focused (set tabindex attribute)
 */

// TODO: implement dom element swap and multiple dom elements
const InteractiveMixin = ( superclass ) => class extends superclass {

	get isInteractive() {

		return true;

	}
	constructor( props ) {

		super( props );

		this.defineProperties( {
			domElement: props.domElement,
			enabled: true,
			_pointerEvents: new PointerEvents( props.domElement, { normalized: true } )
		} );

		this.onPointerDown = this.onPointerDown.bind( this );
		this.onPointerHover = this.onPointerHover.bind( this );
		this.onPointerMove = this.onPointerMove.bind( this );
		this.onPointerUp = this.onPointerUp.bind( this );
		this.onKeyDown = this.onKeyDown.bind( this );
		this.onKeyUp = this.onKeyUp.bind( this );
		this.onWheel = this.onWheel.bind( this );
		this.onContextmenu = this.onContextmenu.bind( this );
		this.onFocus = this.onFocus.bind( this );
		this.onBlur = this.onBlur.bind( this );

		this._addEvents();

	}
	dispose() {

		this._removeEvents();
		this._pointerEvents.dispose();

	}
	_addEvents() {

		if ( this._listening ) return;
		this._pointerEvents.addEventListener( 'pointerdown', this.onPointerDown );
		this._pointerEvents.addEventListener( 'pointerhover', this.onPointerHover );
		this._pointerEvents.addEventListener( 'pointermove', this.onPointerMove );
		this._pointerEvents.addEventListener( 'pointerup', this.onPointerUp );
		this._pointerEvents.addEventListener( 'keydown', this.onKeyDown );
		this._pointerEvents.addEventListener( 'keyup', this.onKeyUp );
		this._pointerEvents.addEventListener( 'wheel', this.onWheel );
		this._pointerEvents.addEventListener( 'contextmenu', this.onContextmenu );
		this._pointerEvents.addEventListener( 'focus', this.onFocus );
		this._pointerEvents.addEventListener( 'blur', this.onBlur );
		this._listening = true;

	}
	_removeEvents() {

		if ( ! this._listening ) return;
		this._pointerEvents.removeEventListener( 'pointerdown', this.onPointerDown );
		this._pointerEvents.removeEventListener( 'pointerhover', this.onPointerHover );
		this._pointerEvents.removeEventListener( 'pointermove', this.onPointerMove );
		this._pointerEvents.removeEventListener( 'pointerup', this.onPointerUp );
		this._pointerEvents.removeEventListener( 'keydown', this.onKeyDown );
		this._pointerEvents.removeEventListener( 'keyup', this.onKeyUp );
		this._pointerEvents.removeEventListener( 'wheel', this.onWheel );
		this._pointerEvents.removeEventListener( 'contextmenu', this.onContextmenu );
		this._pointerEvents.removeEventListener( 'focus', this.onFocus );
		this._pointerEvents.removeEventListener( 'blur', this.onBlur );
		this._listening = false;

	}
	enabledChanged( value ) {

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

class Interactive extends InteractiveMixin( Helper ) {}

/**
 * @author mrdoob / http://mrdoob.com/
 */

const BufferGeometryUtils = {

	computeTangents: function ( geometry ) {

		let index = geometry.index;
		let attributes = geometry.attributes;

		// based on http://www.terathon.com/code/tangent.html
		// (per vertex tangents)

		if ( index === null ||
			attributes.position === undefined ||
			attributes.normal === undefined ||
			attributes.uv === undefined ) {

			console.warn( 'BufferGeometry: Missing required attributes (index, position, normal or uv) in BufferGeometry.computeTangents()' );
			return;

		}

		let indices = index.array;
		let positions = attributes.position.array;
		let normals = attributes.normal.array;
		let uvs = attributes.uv.array;

		let nVertices = positions.length / 3;

		if ( attributes.tangent === undefined ) {

			geometry.addAttribute( 'tangent', new BufferAttribute( new Float32Array( 4 * nVertices ), 4 ) );

		}

		let tangents = attributes.tangent.array;

		let tan1 = [], tan2 = [];

		for ( let i = 0; i < nVertices; i ++ ) {

			tan1[ i ] = new Vector3();
			tan2[ i ] = new Vector3();

		}

		let vA = new Vector3(),
			vB = new Vector3(),
			vC = new Vector3(),

			uvA = new Vector2(),
			uvB = new Vector2(),
			uvC = new Vector2(),

			sdir = new Vector3(),
			tdir = new Vector3();

		function handleTriangle( a, b, c ) {

			vA.fromArray( positions, a * 3 );
			vB.fromArray( positions, b * 3 );
			vC.fromArray( positions, c * 3 );

			uvA.fromArray( uvs, a * 2 );
			uvB.fromArray( uvs, b * 2 );
			uvC.fromArray( uvs, c * 2 );

			let x1 = vB.x - vA.x;
			let x2 = vC.x - vA.x;

			let y1 = vB.y - vA.y;
			let y2 = vC.y - vA.y;

			let z1 = vB.z - vA.z;
			let z2 = vC.z - vA.z;

			let s1 = uvB.x - uvA.x;
			let s2 = uvC.x - uvA.x;

			let t1 = uvB.y - uvA.y;
			let t2 = uvC.y - uvA.y;

			let r = 1.0 / ( s1 * t2 - s2 * t1 );

			sdir.set(
				( t2 * x1 - t1 * x2 ) * r,
				( t2 * y1 - t1 * y2 ) * r,
				( t2 * z1 - t1 * z2 ) * r
			);

			tdir.set(
				( s1 * x2 - s2 * x1 ) * r,
				( s1 * y2 - s2 * y1 ) * r,
				( s1 * z2 - s2 * z1 ) * r
			);

			tan1[ a ].add( sdir );
			tan1[ b ].add( sdir );
			tan1[ c ].add( sdir );

			tan2[ a ].add( tdir );
			tan2[ b ].add( tdir );
			tan2[ c ].add( tdir );

		}

		let groups = geometry.groups;

		if ( groups.length === 0 ) {

			groups = [ {
				start: 0,
				count: indices.length
			} ];

		}

		for ( let i = 0, il = groups.length; i < il; ++ i ) {

			let group = groups[ i ];

			let start = group.start;
			let count = group.count;

			for ( let j = start, jl = start + count; j < jl; j += 3 ) {

				handleTriangle(
					indices[ j + 0 ],
					indices[ j + 1 ],
					indices[ j + 2 ]
				);

			}

		}

		let tmp = new Vector3(), tmp2 = new Vector3();
		let n = new Vector3(), n2 = new Vector3();
		let w, t, test;

		function handleVertex( v ) {

			n.fromArray( normals, v * 3 );
			n2.copy( n );

			t = tan1[ v ];

			// Gram-Schmidt orthogonalize

			tmp.copy( t );
			tmp.sub( n.multiplyScalar( n.dot( t ) ) ).normalize();

			// Calculate handedness

			tmp2.crossVectors( n2, t );
			test = tmp2.dot( tan2[ v ] );
			w = ( test < 0.0 ) ? - 1.0 : 1.0;

			tangents[ v * 4 ] = tmp.x;
			tangents[ v * 4 + 1 ] = tmp.y;
			tangents[ v * 4 + 2 ] = tmp.z;
			tangents[ v * 4 + 3 ] = w;

		}

		for ( let i = 0, il = groups.length; i < il; ++ i ) {

			let group = groups[ i ];

			let start = group.start;
			let count = group.count;

			for ( let j = start, jl = start + count; j < jl; j += 3 ) {

				handleVertex( indices[ j + 0 ] );
				handleVertex( indices[ j + 1 ] );
				handleVertex( indices[ j + 2 ] );

			}

		}

	},

	/**
	* @param  {Array<BufferGeometry>} geometries
	* @return {BufferGeometry}
	*/
	mergeBufferGeometries: function ( geometries, useGroups ) {

		let isIndexed = geometries[ 0 ].index !== null;

		let attributesUsed = new Set( Object.keys( geometries[ 0 ].attributes ) );
		let morphAttributesUsed = new Set( Object.keys( geometries[ 0 ].morphAttributes ) );

		let attributes = {};
		let morphAttributes = {};

		let mergedGeometry = new BufferGeometry();

		let offset = 0;

		for ( let i = 0; i < geometries.length; ++ i ) {

			let geometry = geometries[ i ];

			// ensure that all geometries are indexed, or none

			if ( isIndexed !== ( geometry.index !== null ) ) return null;

			// gather attributes, exit early if they're different

			for ( let name in geometry.attributes ) {

				if ( ! attributesUsed.has( name ) ) return null;

				if ( attributes[ name ] === undefined ) attributes[ name ] = [];

				attributes[ name ].push( geometry.attributes[ name ] );

			}

			// gather morph attributes, exit early if they're different

			for ( let name in geometry.morphAttributes ) {

				if ( ! morphAttributesUsed.has( name ) ) return null;

				if ( morphAttributes[ name ] === undefined ) morphAttributes[ name ] = [];

				morphAttributes[ name ].push( geometry.morphAttributes[ name ] );

			}

			// gather .userData

			mergedGeometry.userData.mergedUserData = mergedGeometry.userData.mergedUserData || [];
			mergedGeometry.userData.mergedUserData.push( geometry.userData );

			if ( useGroups ) {

				let count;

				if ( isIndexed ) {

					count = geometry.index.count;

				} else if ( geometry.attributes.position !== undefined ) {

					count = geometry.attributes.position.count;

				} else {

					return null;

				}

				mergedGeometry.addGroup( offset, count, i );

				offset += count;

			}

		}

		// merge indices

		if ( isIndexed ) {

			let indexOffset = 0;
			let mergedIndex = [];

			for ( let i = 0; i < geometries.length; ++ i ) {

				let index = geometries[ i ].index;

				for ( let j = 0; j < index.count; ++ j ) {

					mergedIndex.push( index.getX( j ) + indexOffset );

				}

				indexOffset += geometries[ i ].attributes.position.count;

			}

			mergedGeometry.setIndex( mergedIndex );

		}

		// merge attributes

		for ( let name in attributes ) {

			let mergedAttribute = this.mergeBufferAttributes( attributes[ name ] );

			if ( ! mergedAttribute ) return null;

			mergedGeometry.addAttribute( name, mergedAttribute );

		}

		// merge morph attributes

		for ( let name in morphAttributes ) {

			let numMorphTargets = morphAttributes[ name ][ 0 ].length;

			if ( numMorphTargets === 0 ) break;

			mergedGeometry.morphAttributes = mergedGeometry.morphAttributes || {};
			mergedGeometry.morphAttributes[ name ] = [];

			for ( let i = 0; i < numMorphTargets; ++ i ) {

				let morphAttributesToMerge = [];

				for ( let j = 0; j < morphAttributes[ name ].length; ++ j ) {

					morphAttributesToMerge.push( morphAttributes[ name ][ j ][ i ] );

				}

				let mergedMorphAttribute = this.mergeBufferAttributes( morphAttributesToMerge );

				if ( ! mergedMorphAttribute ) return null;

				mergedGeometry.morphAttributes[ name ].push( mergedMorphAttribute );

			}

		}

		return mergedGeometry;

	},

	/**
	* @param {Array<BufferAttribute>} attributes
	* @return {BufferAttribute}
	*/
	mergeBufferAttributes: function ( attributes ) {

		let TypedArray;
		let itemSize;
		let normalized;
		let arrayLength = 0;

		for ( let i = 0; i < attributes.length; ++ i ) {

			let attribute = attributes[ i ];

			if ( attribute.isInterleavedBufferAttribute ) return null;

			if ( TypedArray === undefined ) TypedArray = attribute.array.constructor;
			if ( TypedArray !== attribute.array.constructor ) return null;

			if ( itemSize === undefined ) itemSize = attribute.itemSize;
			if ( itemSize !== attribute.itemSize ) return null;

			if ( normalized === undefined ) normalized = attribute.normalized;
			if ( normalized !== attribute.normalized ) return null;

			arrayLength += attribute.array.length;

		}

		let array = new TypedArray( arrayLength );
		let offset = 0;

		for ( let i = 0; i < attributes.length; ++ i ) {

			array.set( attributes[ i ].array, offset );

			offset += attributes[ i ].array.length;

		}

		return new BufferAttribute( array, itemSize, normalized );

	}

};

const _colors = {
	black: new Color( 0x000000 ),
	red: new Color( 0xff0000 ),
	green: new Color( 0x00ff00 ),
	blue: new Color( 0x0000ff ),
	white: new Color( 0xffffff ),
	gray: new Color( 0x787878 ),
	yellow: new Color( 0xffff00 ),
	cyan: new Color( 0x00ffff ),
	magenta: new Color( 0xff00ff ),
};

// TODO: dithering instead transparency
// TODO: pixel-perfect outlines

class HelperMaterial extends IoLiteMixin( ShaderMaterial ) {

	constructor( color, opacity ) {

		super( {
			depthTest: true,
			depthWrite: true,
		} );

		this.defineProperties( {
			color: color !== undefined ? _colors[ color ] : _colors[ 'white' ],
			opacity: opacity !== undefined ? opacity : 1,
			side: DoubleSide,
			transparent: true,
			highlight: 0,
			// wireframe: true
		} );


		this.uniforms = UniformsUtils.merge( [ this.uniforms, {
			"uColor": { value: this.color },
			"uOpacity": { value: this.opacity },
			"uHighlight": { value: this.highlight }
		} ] );

		this.vertexShader = `
			attribute vec4 color;
			attribute float outline;
			varying vec4 vColor;
			varying vec3 vNormal;
			varying float vOutline;
			void main() {
				vColor = color;
				vOutline = outline;
				vNormal = normalize( normalMatrix * normal );
				vec4 pos = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				float aspect = projectionMatrix[0][0] / projectionMatrix[1][1];
				vec3 sNormal = normalize(vec3(vNormal.x, vNormal.y, 0));

				if (outline > 0.0) {
					pos.x += sNormal.x * .0018 * (pos.w) * aspect;
					pos.y += sNormal.y * .0018 * (pos.w);
					pos.z += .1;
				}

				gl_Position = pos;
			}
		`;
		this.fragmentShader = `
			varying vec4 vColor;
			varying vec3 vNormal;
			varying float vOutline;
			uniform vec3 uColor;
			uniform float uOpacity;
			uniform float uHighlight;
			void main() {
				if (vOutline != 0.0) {
					if (uHighlight == 0.0) {
						gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
					} else if (uHighlight == 1.0) {
						gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 );
					} else {
						gl_FragColor = vec4( 0.5, 0.5, 0.5, 1.0 * 0.15 );
					}
					return;
				}
				float dimming = 1.0;
				if (uHighlight == -1.0) dimming = 0.15;
				gl_FragColor = vec4( uColor * vColor.rgb, uOpacity * vColor.a * dimming );
			}
		`;

	}
	colorChanged() {

		this.uniforms.uColor.value = this.color;
		this.uniformsNeedUpdate = true;

	}
	opacityChanged() {

		this.uniforms.uOpacity.value = this.opacity;
		// this.transparent = this.opacity < 1 || this.highlight === -1;
		this.uniformsNeedUpdate = true;

	}
	highlightChanged() {

		this.uniforms.uHighlight.value = this.highlight;
		// this.transparent = this.opacity < 1 || this.highlight === -1;
		this.uniformsNeedUpdate = true;

	}

}

/**
 * @author arodic / https://github.com/arodic
 */

class HelperMesh extends Mesh {

	constructor( geometry, props = {} ) {

		super();
		this.geometry = geometry instanceof Array ? mergeGeometryChunks( geometry ) : geometry;
		this.material = new HelperMaterial( props.color || 'white', props.opacity || 1 );
		// name properties are essential for picking and updating logic.
		this.name = props.name;
		// this.material.wireframe = true;
		this.renderOrder = Infinity;

	}

}

// Reusable utility variables
const _position = new Vector3();
const _euler = new Euler();
const _quaternion = new Quaternion();
const _scale = new Vector3();
const _matrix = new Matrix4();

function mergeGeometryChunks( chunks ) {

	let geometry = new BufferGeometry();

	geometry.index = new Uint16BufferAttribute( [], 1 );
	geometry.addAttribute( 'position', new Float32BufferAttribute( [], 3 ) );
	geometry.addAttribute( 'uv', new Float32BufferAttribute( [], 2 ) );
	geometry.addAttribute( 'color', new Float32BufferAttribute( [], 4 ) );
	geometry.addAttribute( 'normal', new Float32BufferAttribute( [], 3 ) );
	geometry.addAttribute( 'outline', new Float32BufferAttribute( [], 1 ) );

	for ( let i = chunks.length; i --; ) {

		const chunk = chunks[ i ];
		let chunkGeo = chunk.geometry.clone();

		const color = chunk.color || [ 1, 1, 1, 1 ];
		const position = chunk.position;
		const rotation = chunk.rotation;
		let scale = chunk.scale;

		if ( scale && typeof scale === 'number' ) scale = [ scale, scale, scale ];

		_position.set( 0, 0, 0 );
		_quaternion.set( 0, 0, 0, 1 );
		_scale.set( 1, 1, 1 );

		if ( position ) _position.set( position[ 0 ], position[ 1 ], position[ 2 ] );
		if ( rotation ) _quaternion.setFromEuler( _euler.set( rotation[ 0 ], rotation[ 1 ], rotation[ 2 ] ) );
		if ( scale ) _scale.set( scale[ 0 ], scale[ 1 ], scale[ 2 ] );

		_matrix.compose( _position, _quaternion, _scale );

		chunkGeo.applyMatrix( _matrix );

		if ( chunkGeo.index === null ) {

			const indices = [];
			for ( let j = 0; j < chunkGeo.attributes.position.count; j ++ ) {

				indices.push( j * 3 + 0 );
				indices.push( j * 3 + 1 );
				indices.push( j * 3 + 2 );

			}
			chunkGeo.index = new Uint16BufferAttribute( indices, 1 );

		}

		const vertCount = chunkGeo.attributes.position.count;

		const colorArray = [];
		for ( let j = 0; j < vertCount; j ++ ) {

			colorArray[ j * 4 + 0 ] = color[ 0 ];
			colorArray[ j * 4 + 1 ] = color[ 1 ];
			colorArray[ j * 4 + 2 ] = color[ 2 ];
			colorArray[ j * 4 + 3 ] = color[ 3 ] !== undefined ? color[ 3 ] : 1;

		}
		chunkGeo.addAttribute( 'color', new Float32BufferAttribute( colorArray, 4 ) );

		// Duplicate geometry and add outline attribute
		const outlineArray = [];
		for ( let j = 0; j < vertCount; j ++ ) outlineArray[ j ] = 1;
		chunkGeo.addAttribute( 'outline', new Float32BufferAttribute( outlineArray, 1 ) );
		chunkGeo = BufferGeometryUtils.mergeBufferGeometries( [ chunkGeo, chunkGeo ] );
		for ( let j = 0; j < vertCount; j ++ ) chunkGeo.attributes.outline.array[ j ] = 0;

		geometry = BufferGeometryUtils.mergeBufferGeometries( [ geometry, chunkGeo ] );

	}
	return geometry;

}

/**
 * @author arodic / https://github.com/arodic
 */

const PI = Math.PI;
const HPI = Math.PI / 2;

const geosphereGeometry = new OctahedronBufferGeometry( 1, 3 );

const octahedronGeometry = new OctahedronBufferGeometry( 1, 0 );

const coneGeometry = new HelperMesh( [
	{ geometry: new CylinderBufferGeometry( 0, 0.2, 1, 8, 2 ), position: [ 0, 0.5, 0 ] },
	{ geometry: new SphereBufferGeometry( 0.2, 8, 8 ) }
] ).geometry;

const lineGeometry = new HelperMesh( [
	{ geometry: new CylinderBufferGeometry( 0.02, 0.02, 1, 4, 2, false ), position: [ 0, 0.5, 0 ] },
	{ geometry: new SphereBufferGeometry( 0.02, 4, 4 ), position: [ 0, 0, 0 ] },
	{ geometry: new SphereBufferGeometry( 0.02, 4, 4 ), position: [ 0, 1, 0 ] }
] ).geometry;

const arrowGeometry = new HelperMesh( [
	{ geometry: coneGeometry, position: [ 0, 0.8, 0 ], scale: 0.2 },
	{ geometry: new CylinderBufferGeometry( 0.005, 0.005, 0.8, 4, 2, false ), position: [ 0, 0.4, 0 ] }
] ).geometry;

const scaleArrowGeometry = new HelperMesh( [
	{ geometry: geosphereGeometry, position: [ 0, 0.8, 0 ], scale: 0.075 },
	{ geometry: new CylinderBufferGeometry( 0.005, 0.005, 0.8, 4, 2, false ), position: [ 0, 0.4, 0 ] }
] ).geometry;

const corner2Geometry = new HelperMesh( [
	{ geometry: new CylinderBufferGeometry( 0.05, 0.05, 1, 4, 2, false ), position: [ 0.5, 0, 0 ], rotation: [ 0, 0, HPI ] },
	{ geometry: new CylinderBufferGeometry( 0.05, 0.05, 1, 4, 2, false ), position: [ 0, 0, 0.5 ], rotation: [ HPI, 0, 0 ] },
	{ geometry: new SphereBufferGeometry( 0.05, 8, 4 ), position: [ 0, 0, 0 ] },
	{ geometry: new SphereBufferGeometry( 0.05, 4, 4 ), position: [ 1, 0, 0 ], rotation: [ 0, 0, HPI ] },
	{ geometry: new SphereBufferGeometry( 0.05, 4, 4 ), position: [ 0, 0, 1 ], rotation: [ HPI, 0, 0 ] },
] ).geometry;

const pickerHandleGeometry = new HelperMesh( [
	{ geometry: new CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), position: [ 0, 0.5, 0 ] }
] ).geometry;

const planeGeometry = new BoxBufferGeometry( 1, 1, 0.01, 1, 1, 1 );

const circleGeometry = new HelperMesh( [
	{ geometry: new OctahedronBufferGeometry( 1, 3 ), scale: [ 1, 0.01, 1 ] },
] ).geometry;

const ringGeometry = new HelperMesh( [
	{ geometry: new TorusBufferGeometry( 1, 0.005, 8, 128 ), rotation: [ HPI, 0, 0 ] },
] ).geometry;

const halfRingGeometry = new HelperMesh( [
	{ geometry: new TorusBufferGeometry( 1, 0.005, 8, 64, PI ), rotation: [ HPI, 0, 0 ] },
] ).geometry;

const ringPickerGeometry = new HelperMesh( [
	{ geometry: new TorusBufferGeometry( 1, 0.1, 8, 128 ), rotation: [ HPI, 0, 0 ] },
] ).geometry;

const rotateHandleGeometry = new HelperMesh( [
	{ geometry: new TorusBufferGeometry( 1, 0.005, 4, 64, PI ) },
	{ geometry: new SphereBufferGeometry( 0.005, 4, 4 ), position: [ 1, 0, 0 ], rotation: [ HPI, 0, 0 ] },
	{ geometry: new SphereBufferGeometry( 0.005, 4, 4 ), position: [ - 1, 0, 0 ], rotation: [ HPI, 0, 0 ] },
	{ geometry: octahedronGeometry, position: [ 0, 0.992, 0 ], scale: [ 0.2, 0.05, 0.05 ] }
] ).geometry;

const rotatePickerGeometry = new HelperMesh( [
	{ geometry: new TorusBufferGeometry( 1, 0.03, 4, 8, PI ) },
	{ geometry: octahedronGeometry, position: [ 0, 0.992, 0 ], scale: 0.2 }
] ).geometry;

class TransformHelper extends Helper {

	constructor( props ) {

		super( props );

		this.defineProperties( {
			showX: true,
			showY: true,
			showZ: true,
			worldX: new Vector3(),
			worldY: new Vector3(),
			worldZ: new Vector3(),
			axisDotEye: new Vector3()
		} );
		this.size = 0.1;

		this.handles = this.combineHelperGroups( this.handlesGroup );
		this.pickers = this.combineHelperGroups( this.pickersGroup );
		if ( this.handles.length ) this.add( ...this.handles );
		if ( this.pickers.length ) this.add( ...this.pickers );

	}
	// Creates an Object3D with gizmos described in custom hierarchy definition.
	combineHelperGroups( groups ) {

		const meshes = [];
		for ( let name in groups ) {

			const mesh = new HelperMesh( groups[ name ], { name: name } );
			mesh.has = char => {

				return mesh.name.search( char ) !== - 1;

			};
			mesh.is = char => {

				return mesh.name === char;

			};
			meshes.push( mesh );

		}
		return meshes;

	}
	get handlesGroup() {

		return {
			X: [ { geometry: coneGeometry, color: [ 1, 0, 0 ], position: [ 0.15, 0, 0 ], rotation: [ 0, 0, - Math.PI / 2 ], scale: [ 0.5, 1, 0.5 ] } ],
			Y: [ { geometry: coneGeometry, color: [ 0, 1, 0 ], position: [ 0, 0.15, 0 ], rotation: [ 0, 0, 0 ], scale: [ 0.5, 1, 0.5 ] } ],
			Z: [ { geometry: coneGeometry, color: [ 0, 0, 1 ], position: [ 0, 0, - 0.15 ], rotation: [ - Math.PI / 2, 0, 0 ], scale: [ 0.5, 1, 0.5 ] } ]
		};

	}
	get pickersGroup() {

		return {
			XYZ: [ { geometry: octahedronGeometry, scale: 0.5 } ]
		};

	}
	updateHelperMatrix() {

		super.updateHelperMatrix();

		for ( let i = this.handles.length; i --; ) this.updateAxis( this.handles[ i ] );
		for ( let i = this.pickers.length; i --; ) this.updateAxis( this.pickers[ i ] );

		this.worldX.set( 1, 0, 0 ).applyQuaternion( this.worldQuaternion );
		this.worldY.set( 0, 1, 0 ).applyQuaternion( this.worldQuaternion );
		this.worldZ.set( 0, 0, 1 ).applyQuaternion( this.worldQuaternion );

		this.axisDotEye.set(
			this.worldX.dot( this.eye ),
			this.worldY.dot( this.eye ),
			this.worldZ.dot( this.eye )
		);

	}
	updateAxis( axis ) {

		// Hide non-enabled Transform
		axis.visible = true;
		axis.visible = axis.visible && ( ! axis.has( "X" ) || this.showX );
		axis.visible = axis.visible && ( ! axis.has( "Y" ) || this.showY );
		axis.visible = axis.visible && ( ! axis.has( "Z" ) || this.showZ );
		axis.visible = axis.visible && ( ! axis.has( "E" ) || ( this.showX && this.showY && this.showZ ) );
		// Hide pickers
		for ( let i = 0; i < this.pickers.length; i ++ ) this.pickers[ i ].material.visible = false;

	}

}

/**
 * @author arodic / https://github.com/arodic
 */

class SelectionHelper extends Helper {

	constructor( props ) {

		super( props );
		const axis = new TransformHelper();
		axis.size = 0.02;
		this.add( axis );
		if ( props.object && props.object.geometry ) {

			this.add( new Line( props.object.geometry, new HelperMaterial( 'white', 0.5 ) ) );

		}

	}

}

/**
 * @author arodic / http://github.com/arodic
 */

// Reusable utility variables
const pos = new Vector3();
const quat = new Quaternion();
const quatInv = new Quaternion();
const scale = new Vector3();

const posOld = new Vector3();
const quatOld = new Quaternion();
const scaleOld = new Vector3();

const posOffset = new Vector3();
const quatOffset = new Quaternion();
const scaleOffset = new Vector3();

const itemPos = new Vector3();
const itemPosOffset = new Vector3();
const itemQuat = new Quaternion();
const itemQuatInv = new Quaternion();
const itemQuatOffset = new Quaternion();
const itemScale = new Vector3();

const parentPos = new Vector3();
const parentQuat = new Quaternion();
const parentQuatInv = new Quaternion();
const parentScale = new Vector3();

const dist0 = new Vector3();
const dist1 = new Vector3();

const selectedOld = [];

function filterItems( list, hierarchy, filter ) {

	list = list instanceof Array ? list : [ list ];
	let filtered = [];
	for ( let i = 0; i < list.length; i ++ ) {

		if ( ! filter || filter( list[ i ] ) ) filtered.push( list[ i ] );
		if ( hierarchy ) {

			let children = filterItems( list[ i ].children, hierarchy, filter );
			filtered.push( ...children );

		}

	}
	return filtered;

}

// Temp variables
const raycaster = new Raycaster();

// @event change
const changeEvent = { type: 'change' };

let time = 0, dtime = 0;
const CLICK_DIST = 0.01;
const CLICK_TIME = 250;

/*
 * Selection object stores selection list and implements various methods for selection list manipulation.
 * Selection object transforms all selected objects when moved in either world or local space.
 *
 * @event chang - fired on selection change.
 * @event selected-changed - also fired on selection change (includes selection payload).
 */

class SelectionControls extends Interactive {

	// get isSelection() { return true; } // TODO?
	get isSelectionControls() {

		return true;

	}
	constructor( props ) {

		super( props );

		this.defineProperties( {
			scene: props.scene || null,
			selected: [],
			transformSelection: true,
			transformSpace: 'local'
			// translationSnap: null,
			// rotationSnap: null
		} );

	}
	select( position, add ) {

		raycaster.setFromCamera( position, this.camera );
		const intersects = raycaster.intersectObjects( this.scene.children, true );
		if ( intersects.length > 0 ) {

			const object = intersects[ 0 ].object;
			// TODO: handle helper selection
			if ( add ) {

				this.toggle( object );

			} else {

				this.replace( object );

			}

		} else {

			this.clear();

		}
		this.dispatchEvent( changeEvent );

	}
	onPointerDown() {

		time = Date.now();

	}
	onPointerUp( pointers ) {

		dtime = Date.now() - time;
		if ( pointers.length === 0 && dtime < CLICK_TIME ) {

			if ( pointers.removed[ 0 ].distance.length() < CLICK_DIST ) {

				this.select( pointers.removed[ 0 ].position, pointers.removed[ 0 ].ctrlKey );

			}

		}

	}
	transformSpaceChanged() {

		this.update();

	}
	toggle( list, hierarchy, filter ) {

		list = filterItems( list, hierarchy, filter );
		selectedOld.push( ...this.selected );
		for ( let i = list.length; i --; ) {

			let index = this.selected.indexOf( list[ i ] );
			if ( index !== - 1 ) this.selected.splice( index, 1 );
			else this.selected.push( list[ i ] );

		}
		this.update();

	}
	add( list, hierarchy, filter ) {

		list = filterItems( list, hierarchy, filter );
		selectedOld.push( ...this.selected );
		this.selected.concat( ...list );
		this.update();

	}
	addFirst( list, hierarchy, filter ) {

		list = filterItems( list, hierarchy, filter );
		selectedOld.push( ...this.selected );
		this.selected.length = 0;
		this.selected.push( ...list );
		this.selected.push( ...selectedOld );
		this.update();

	}
	remove( list, hierarchy, filter ) {

		list = filterItems( list, hierarchy, filter );
		selectedOld.push( ...this.selected );
		for ( let i = list.length; i --; ) {

			let index = this.selected.indexOf( list[ i ] );
			if ( index !== - 1 ) this.selected.splice( i, 1 );

		}
		this.update();

	}
	replace( list, hierarchy, filter ) {

		list = filterItems( list, hierarchy, filter );
		selectedOld.push( ...this.selected );
		this.selected.length = 0;
		this.selected.push( ...list );
		this.update();

	}
	clear() {

		selectedOld.push( ...this.selected );
		this.selected.length = 0;
		this.update();

	}
	update() {

		// Reset selection transform.
		this.position.set( 0, 0, 0, 1 );
		this.quaternion.set( 0, 0, 0, 1 );
		this.scale.set( 1, 1, 1 );

		if ( this.selected.length && this.transformSelection ) {

			// Set selection transform to last selected item (not ancestor of selected).
			if ( this.transformSpace === 'local' ) {

				for ( let i = this.selected.length; i --; ) {

					if ( this._isAncestorOfSelected( this.selected[ i ] ) ) continue;
					this.selected[ i ].updateMatrixWorld();
					this.selected[ i ].matrixWorld.decompose( itemPos, itemQuat, itemScale );
					this.position.copy( itemPos );
					this.quaternion.copy( itemQuat );
					break;

				}
				// Set selection transform to the average of selected items.

			} else if ( this.transformSpace === 'world' ) {

				pos.set( 0, 0, 0 );
				for ( let i = 0; i < this.selected.length; i ++ ) {

					this.selected[ i ].updateMatrixWorld();
					this.selected[ i ].matrixWorld.decompose( itemPos, itemQuat, itemScale );
					pos.add( itemPos );

				}
				this.position.copy( pos ).divideScalar( this.selected.length );

			}

		}

		// TODO: apply snapping
		// Apply translation snap
		// if (this.translationSnap) {
		// 	if (space === 'local') {
		// 		object.position.applyQuaternion(_tempQuaternion.copy(this.quaternionStart).inverse());
		// 		if (axis.hasAxis('X')) object.position.x = Math.round(object.position.x / this.translationSnap) * this.translationSnap;
		// 		if (axis.hasAxis('Y')) object.position.y = Math.round(object.position.y / this.translationSnap) * this.translationSnap;
		// 		if (axis.hasAxis('Z')) object.position.z = Math.round(object.position.z / this.translationSnap) * this.translationSnap;
		// 		object.position.applyQuaternion(this.quaternionStart);
		// 	}
		// 	if (space === 'world') {
		// 		if (object.parent) {
		// 			object.position.add(_tempVector.setFromMatrixPosition(object.parent.matrixWorld));
		// 		}
		// 		if (axis.hasAxis('X')) object.position.x = Math.round(object.position.x / this.translationSnap) * this.translationSnap;
		// 		if (axis.hasAxis('Y')) object.position.y = Math.round(object.position.y / this.translationSnap) * this.translationSnap;
		// 		if (axis.hasAxis('Z')) object.position.z = Math.round(object.position.z / this.translationSnap) * this.translationSnap;
		// 		if (object.parent) {
		// 			object.position.sub(_tempVector.setFromMatrixPosition(object.parent.matrixWorld));
		// 		}
		// 	}
		// }
		// Apply rotation snap
		// if (space === 'local') {
		// 	const snap = this.rotationSnap;
		// 	if (this.axis === 'X' && snap) this.object.rotation.x = Math.round(this.object.rotation.x / snap) * snap;
		// 	if (this.axis === 'Y' && snap) this.object.rotation.y = Math.round(this.object.rotation.y / snap) * snap;
		// 	if (this.axis === 'Z' && snap) this.object.rotation.z = Math.round(this.object.rotation.z / snap) * snap;
		// }
		// if (this.rotationSnap) this.rotationAngle = Math.round(this.rotationAngle / this.rotationSnap) * this.rotationSnap;

		// Add helpers
		// TODO: cache helpers per object
		this.children.length = 0;
		for ( let i = 0; i < this.selected.length; i ++ ) {

			const _helper = new SelectionHelper( { object: this.selected[ i ] } );
			this.children.push( _helper );

		}

		super.updateMatrixWorld();

		// gather selection data and emit selection-changed event
		let added = [];
		for ( let i = 0; i < this.selected.length; i ++ ) {

			if ( selectedOld.indexOf( this.selected[ i ] ) === - 1 ) {

				added.push( this.selected[ i ] );

			}

		}
		let removed = [];
		for ( let i = 0; i < selectedOld.length; i ++ ) {

			if ( this.selected.indexOf( selectedOld[ i ] ) === - 1 ) {

				removed.push( selectedOld[ i ] );

			}

		}
		selectedOld.length = 0;
		this.dispatchEvent( { type: 'change' } );
		this.dispatchEvent( { type: 'selected-changed', selected: [ ...this.selected ], added: added, removed: removed } );

	}
	updateMatrixWorld() {

		// Extract tranformations before and after matrix update.
		this.matrix.decompose( posOld, quatOld, scaleOld );
		super.updateMatrixWorld();
		this.matrix.decompose( pos, quat, scale );
		// Get transformation offsets from transform deltas.
		posOffset.copy( pos ).sub( posOld );
		quatOffset.copy( quat ).multiply( quatOld.inverse() );
		scaleOffset.copy( scale ).sub( scaleOld );
		quatInv.copy( quat ).inverse();

		if ( ! this.selected.length || ! this.transformSelection ) return;
		// Apply tranformatio offsets to ancestors.
		for ( let i = 0; i < this.selected.length; i ++ ) {

			// get local transformation variables.
			this.selected[ i ].updateMatrixWorld();
			this.selected[ i ].matrixWorld.decompose( itemPos, itemQuat, itemScale );
			this.selected[ i ].parent.matrixWorld.decompose( parentPos, parentQuat, parentScale );
			parentQuatInv.copy( parentQuat ).inverse();
			itemQuatInv.copy( itemQuat ).inverse();
			// Transform selected in local space.
			if ( this.transformSpace === 'local' ) {

				// Position
				itemPosOffset.copy( posOffset ).applyQuaternion( quatInv );
				itemPosOffset.applyQuaternion( this.selected[ i ].quaternion );
				this.selected[ i ].position.add( itemPosOffset );
				// Rotation
				itemQuatOffset.copy( quatInv ).multiply( quatOffset ).multiply( quat ).normalize();
				this.selected[ i ].quaternion.multiply( itemQuatOffset );
				// Scale
				if ( this._isAncestorOfSelected( this.selected[ i ] ) ) continue; // lets not go there...
				this.selected[ i ].scale.add( scaleOffset );
			// Transform selected in world space.

			} else if ( this.transformSpace === 'world' ) {

				if ( this._isAncestorOfSelected( this.selected[ i ] ) ) continue;
				// Position
				itemPosOffset.copy( posOffset ).applyQuaternion( parentQuatInv );
				this.selected[ i ].position.add( itemPosOffset );
				// Rotation
				dist0.subVectors( itemPos, pos );
				dist1.subVectors( itemPos, pos ).applyQuaternion( quatOffset );
				dist1.sub( dist0 ).applyQuaternion( parentQuatInv );
				this.selected[ i ].position.add( dist1 );
				itemQuatOffset.copy( itemQuatInv ).multiply( quatOffset ).multiply( itemQuat ).normalize();
				this.selected[ i ].quaternion.multiply( itemQuatOffset );
				// Scale
				this.selected[ i ].scale.add( scaleOffset );

			}
			this.selected[ i ].updateMatrixWorld();

		}

	}
	_isAncestorOfSelected( object ) {

		let parent = object.parent;
		while ( parent ) {

			if ( this.selected.indexOf( parent ) !== - 1 ) return true;
			object = parent, parent = object.parent;

		}
		return false;

	}

}

export { SelectionControls };
