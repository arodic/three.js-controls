/**
 * @author arodic / https://github.com/arodic
 */

import {Mesh, Vector3, Euler, Quaternion, Matrix4, BufferGeometry, Uint16BufferAttribute, Float32BufferAttribute} from "../../lib/three.module.js";
import {BufferGeometryUtils} from "../../lib/BufferGeometryUtils.js";
import {HelperMaterial} from "./HelperMaterial.js";

export class HelperMesh extends Mesh {
	constructor(geometry, props = {}) {
		super();
		this.geometry = geometry instanceof Array ? mergeGeometryChunks(geometry) : geometry;
		this.material = new HelperMaterial(props.color || 'white', props.opacity || 1);
		this.scaleTarget = new Vector3(1, 1, 1);
		this.hidden = false;
		this.highlight = 0;
		this.name = props.name;
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

		let thickness = chunk.thickness / 2 || 0;
		let outlineThickness = chunk.outlineThickness !== undefined ? chunk.outlineThickness : 1;

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
			for (let j = 0; j < chunkGeo.attributes.position.count - 2; j++) {
				indices.push(j + 0);
				indices.push(j + 1);
				indices.push(j + 2);
			}
			chunkGeo.index = new Uint16BufferAttribute(indices, 1);
		}

		let vertCount = chunkGeo.attributes.position.count;

		if (!chunkGeo.attributes.color) {
			chunkGeo.addAttribute('color', new Float32BufferAttribute(new Array(vertCount * 4), 4));
		}

		const colorArray = chunkGeo.attributes.color.array;
		for (let j = 0; j < vertCount; j++) {
			const r = j * 4 + 0; colorArray[r] = color[0];
			const g = j * 4 + 1; colorArray[g] = color[1];
			const b = j * 4 + 2; colorArray[b] = color[2];
			const a = j * 4 + 3; colorArray[a] = color[3] !== undefined ? color[3] : colorArray[a] !== undefined ? colorArray[a] : 1;
		}

		// Duplicate geometry and add outline attribute
		//TODO: enable outline overwrite (needs to know if is outline or not in combined geometry)
		if (!chunkGeo.attributes.outline) {
			const outlineArray = [];
			for (let j = 0; j < vertCount; j++) outlineArray[j] = -(thickness) || 0;
			chunkGeo.addAttribute( 'outline', new Float32BufferAttribute( outlineArray, 1 ) );
			chunkGeo = BufferGeometryUtils.mergeBufferGeometries([chunkGeo, chunkGeo]);
			if (outlineThickness) {
				for (let j = 0; j < vertCount; j++) chunkGeo.attributes.outline.array[(vertCount) + j] = outlineThickness + (thickness);
			}

			let array = chunkGeo.index.array;
			for (let j = array.length / 2; j < array.length; j+=3) {
				let a = array[j + 1];
				let b = array[j + 2];
				array[j + 1] = b;
				array[j + 2] = a;
			}

		}


		geometry = BufferGeometryUtils.mergeBufferGeometries([geometry, chunkGeo]);
	}
	return geometry;
}
