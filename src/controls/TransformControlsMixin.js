/**
 * @author arodic / https://github.com/arodic
 */

import {Raycaster, Vector3, Quaternion, Plane, Mesh, PlaneBufferGeometry, MeshBasicMaterial} from "../../lib/three.module.js";
import {InteractiveMixin} from "../Interactive.js";

// Reusable utility variables
const _ray = new Raycaster();
const _rayTarget = new Vector3();
const _tempVector = new Vector3();

// events
const changeEvent = { type: "change" };

export const TransformControlsMixin = (superclass) => class extends InteractiveMixin(superclass) {
	constructor(props) {
		super(props);

		this.visible = false;

		this.defineProperties({
			active: false,

			pointStart: new Vector3(),
			pointEnd: new Vector3(),

			positionStart: new Vector3(),
			quaternionStart: new Quaternion(),
			scaleStart: new Vector3(),

			_plane: new Plane()
		});

		this.add(this._planeDebugMesh = new Mesh(new PlaneBufferGeometry(1000, 1000, 10, 10), new MeshBasicMaterial({wireframe: true, transparent: true, opacity: 0.2})));
	}
	objectChanged() {
		super.objectChanged();
		let hasObject = this.object ? true : false;
		this.visible = hasObject;
		if (!hasObject) {
			this.active = false;
			this.axis = null;
		}
		this.animation.startAnimation(1.5);
	}
	// TODO: better animation trigger
	// TODO: also trigger on object change
	// TODO: Debug stalling animations on hover
	enabledChanged(value) {
		super.enabledChanged(value);
		this.animation.startAnimation(0.5);
	}
	axisChanged() {
		super.axisChanged();
		this.updatePlane();
	}
	activeChanged() {
		this.animation.startAnimation(0.5);
	}
	onPointerHover(pointers) {
		if (!this.object || this.active === true) return;

		_ray.setFromCamera(pointers[0].position, this.camera);
		const intersect = _ray.intersectObjects(this.pickers, true)[0] || false;

		this.axis = intersect ? intersect.object.name : null;
	}
	onPointerDown(pointers) {
		if (this.axis === null || !this.object || this.active === true || pointers[0].button !== 0) return;

		_ray.setFromCamera(pointers[0].position, this.camera);
		const planeIntersect = _ray.ray.intersectPlane(this._plane, _rayTarget);

		if (planeIntersect) {
			this.object.updateMatrixWorld();
			this.object.matrix.decompose(this.positionStart, this.quaternionStart, this.scaleStart);

			this.pointStart.copy(planeIntersect).sub(this.positionStart);
			this.active = true;
		}
	}
	onPointerMove(pointers) {
		if (this.object === undefined || this.axis === null || this.active === false || pointers[0].button !== 0) return;

		_ray.setFromCamera(pointers[0].position, this.camera);
		const planeIntersect = _ray.ray.intersectPlane(this._plane, _tempVector);

		if (planeIntersect) {
			this.pointEnd.copy(planeIntersect).sub(this.positionStart);
			this.transform();

			this.dispatchEvent(changeEvent);
		}

	}
	onPointerUp(pointers) {
		if (pointers.length === 0) {
			if (pointers.removed[0].pointerType === 'touch') this.axis = null;
			this.active = false;
		} else if (pointers[0].button === -1) {
			this.axis = null;
			this.active = false;
		}
	}
	transform() {}
	updateAxis(axis) {
		super.updateAxis(axis);
		if (!this.enabled) axis.material.highlight = (10 * axis.material.highlight - 2.5) / 11;
	}
	updatePlane() {
		const normal = this._plane.normal;

		if (this.axis === 'X') normal.copy(this.worldX).cross(_tempVector.copy(this.eye).cross(this.worldX));
		if (this.axis === 'Y') normal.copy(this.worldY).cross(_tempVector.copy(this.eye).cross(this.worldY));
		if (this.axis === 'Z') normal.copy(this.worldZ).cross(_tempVector.copy(this.eye).cross(this.worldZ));
		if (this.axis === 'XY') normal.copy(this.worldZ);
		if (this.axis === 'YZ') normal.copy(this.worldX);
		if (this.axis === 'XZ') normal.copy(this.worldY);
		if (this.axis === 'XYZ' || this.axis === 'E') this.camera.getWorldDirection(normal);

		this._plane.setFromNormalAndCoplanarPoint(normal, this.position);

		this.parent.add(this._planeDebugMesh);
		this._planeDebugMesh.position.set(0,0,0);
		this._planeDebugMesh.lookAt(normal);
		this._planeDebugMesh.position.copy(this.position);
	}
};
