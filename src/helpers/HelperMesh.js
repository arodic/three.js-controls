/**
 * @author arodic / https://github.com/arodic
 */

import {Mesh, Vector3, Euler, Quaternion, Matrix4, BufferGeometry, Uint16BufferAttribute, Float32BufferAttribute} from "../../../three.js/build/three.module.js";
import {BufferGeometryUtils} from "../../lib/BufferGeometryUtils.js";
import {HelperMaterial} from "./HelperMaterial.js";

export class HelperMesh extends Mesh {
	constructor(geometry, props = {}) {
		super();
		this.geometry = geometry instanceof Array ? mergeGeometryChunks(geometry) : geometry;
		this.material = new HelperMaterial(props.color || 'white', props.opacity || 1);
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

export function mergeGeometryChunks(chunks) {

let geometry = new BufferGeometry();

geometry.index = new Uint16BufferAttribute([], 1);
geometry.addAttribute('position', new Float32BufferAttribute([], 3));
geometry.addAttribute('uv', new Float32BufferAttribute([], 2));
geometry.addAttribute('color', new Float32BufferAttribute([], 4));
geometry.addAttribute('normal', new Float32BufferAttribute([], 3));
geometry.addAttribute('outline', new Float32BufferAttribute([], 1));

for (let i = chunks.length; i--;) {

		const chunk = chunks[i];
		let chunkGeo = chunk.geometry.clone();

		const color = chunk.color || [1,1,1,1];
		const position = chunk.position;
		const rotation = chunk.rotation;
		let scale = chunk.scale;

		if (scale && typeof scale === 'number') scale = [scale, scale, scale];

		_position.set(0, 0, 0);
		_quaternion.set(0, 0, 0, 1);
		_scale.set(1, 1, 1);

		if (position) _position.set(position[0], position[1], position[2]);
		if (rotation) _quaternion.setFromEuler(_euler.set(rotation[0], rotation[1], rotation[2]));
		if (scale) _scale.set(scale[0], scale[1], scale[2]);

		_matrix.compose(_position, _quaternion, _scale);

		chunkGeo.applyMatrix(_matrix);

		if (chunkGeo.index === null) {
			const indices = [];
			for (let j = 0; j < chunkGeo.attributes.position.count; j++) {
				indices.push(j * 3 + 0);
				indices.push(j * 3 + 1);
				indices.push(j * 3 + 2);
			}
			chunkGeo.index = new Uint16BufferAttribute(indices, 1);
		}

		const vertCount = chunkGeo.attributes.position.count;

		const colorArray = [];
		for (let j = 0; j < vertCount; j++) {
			colorArray[j * 4 + 0] = color[0];
			colorArray[j * 4 + 1] = color[1];
			colorArray[j * 4 + 2] = color[2];
			colorArray[j * 4 + 3] = color[3] !== undefined ? color[3] : 1;
		}
		chunkGeo.addAttribute('color', new Float32BufferAttribute(colorArray, 4));

		// Duplicate geometry and add outline attribute
		const outlineArray = [];
		for (let j = 0; j < vertCount; j++) outlineArray[j] = 1;
		chunkGeo.addAttribute( 'outline', new Float32BufferAttribute( outlineArray, 1 ) );
		chunkGeo = BufferGeometryUtils.mergeBufferGeometries([chunkGeo, chunkGeo]);
		for (let j = 0; j < vertCount; j++) chunkGeo.attributes.outline.array[j] = 0;

		geometry = BufferGeometryUtils.mergeBufferGeometries([geometry, chunkGeo]);
	}
	return geometry;
}
