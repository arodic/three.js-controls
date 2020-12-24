import { Mesh, Object3D, Quaternion, Vector3, Matrix4 } from 'three';
import { PointerTracker } from './core/Pointers';
import { AnyCameraType } from './core/Base';
import { Controls } from './core/Controls';
import { TransformHelper } from './TransformHelper';

export { TransformHelper } from './TransformHelper';

export declare const TRANSFORM_CHANGE_EVENT: {
	type: string;
};

declare class TransformControls extends Controls {

	static readonly isTransformControls = true;
	static readonly type = "TransformControls";
	size: number;
	showX: boolean;
	showY: boolean;
	showZ: boolean;
	showTranslate: boolean;
	showRotate: boolean;
	showScale: boolean;
	object?: Object3D;
	dragging: boolean;
	active: boolean;
	space: string;
	activeMode: 'translate' | 'rotate' | 'scale' | '';
	activeAxis: 'X' | 'Y' | 'Z' | 'XY' | 'YZ' | 'XZ' | 'XYZ' | 'XYZE' | 'XYZX' | 'XYZY' | 'XYZZ' | 'E' | '';
	translationSnap: number;
	rotationSnap: number;
	scaleSnap: number;
	minGrazingAngle: number;
	FADE_EPS: number;
	FADE_FACTOR: number;
	private readonly _pointStart;
	private readonly _pointEnd;
	private readonly _pointStartNorm;
	private readonly _pointEndNorm;
	protected readonly transformMatrixStart: Matrix4;
	protected readonly transformMatrixEnd: Matrix4;
	protected readonly transformMatrixOffset: Matrix4;
	protected readonly parentWorldPosition: Vector3;
	protected readonly parentWorldQuaternion: Quaternion;
	protected readonly parentWorldQuaternionInv: Quaternion;
	protected readonly parentWorldScale: Vector3;
	protected readonly objectWorldPositionStart: Vector3;
	protected readonly objectWorldQuaternionStart: Quaternion;
	protected readonly objectWorldScaleStart: Vector3;
	protected readonly objectWorldPosition: Vector3;
	protected readonly objectWorldQuaternion: Quaternion;
	protected readonly objectWorldQuaternionInv: Quaternion;
	protected readonly objectWorldScale: Vector3;
	protected readonly objectPositionStart: Vector3;
	protected readonly objectQuaternionStart: Quaternion;
	protected readonly objectQuaternionStartInv: Quaternion;
	protected readonly objectScaleStart: Vector3;
	protected readonly rotationAxis: Vector3;
	private readonly _tempVector;
	private readonly _offsetVector;
	private readonly _tempQuaternion;
	private readonly _targetColor;
	private readonly _dirX;
	private readonly _dirY;
	private readonly _dirZ;
	private readonly _dirVector;
	private readonly _identityQuaternion;
	private readonly _viewportCameraPosition;
	private readonly _viewportCameraQuaternion;
	private readonly _viewportCameraScale;
	private readonly _viewportEye;
	protected readonly _cameraHelpers: Map<AnyCameraType, TransformHelper>;
	constructor( camera: AnyCameraType, domElement: HTMLElement );
	cameraChanged( newCamera: AnyCameraType ): void;
	getHelper( camera: AnyCameraType ): TransformHelper;
	dispose(): void;
	decomposeViewportCamera( camera: AnyCameraType ): Vector3;
	updateHandleMaterial( handle: Mesh ): void;
	updateHandle( handle: Mesh ): void;
	decomposeMatrices(): void;
	updateMatrixWorld(): void;
	getPlaneNormal( cameraQuaternion: Quaternion ): Vector3;
	onTrackedPointerHover( pointer: PointerTracker ): void;
	onTrackedPointerDown( pointer: PointerTracker ): void;
	onTrackedPointerMove( pointer: PointerTracker ): void;
	onTrackedPointerUp( pointer: PointerTracker ): void;
	attach( object: Object3D ): this;
	detach(): this;
	getMode(): void;
	setMode( mode: 'translate' | 'rotate' | 'scale' ): void;
	setTranslationSnap( translationSnap: number ): void;
	setRotationSnap( rotationSnap: number ): void;
	setScaleSnap( scaleSnap: number ): void;
	setSize( size: number ): void;
	setSpace( space: string ): void;
	update(): void;
	addEventListener( type: string, listener: ( event: Event ) => void ): void;

}

export { TransformControls };
