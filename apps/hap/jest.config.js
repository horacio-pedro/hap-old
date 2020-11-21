module.exports = {
	name: 'hap',
	preset: '../../jest.config.js',
	coverageDirectory: '../../coverage/apps/hap',
	snapshotSerializers: [
		'jest-preset-angular/AngularSnapshotSerializer.js',
		'jest-preset-angular/HTMLCommentSerializer.js'
	]
};
