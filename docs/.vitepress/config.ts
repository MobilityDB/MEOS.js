import { defineConfig } from 'vitepress';

export default defineConfig({
	title: 'MEOS.js',
	description: 'TypeScript/WebAssembly bindings for MobilityDB MEOS',
	base: '/MEOS.js/',

	themeConfig: {
		nav: [
			{ text: 'Guide', link: '/guide/getting-started' },
			{ text: 'API', link: '/api/' },
			{
				text: 'GitHub',
				link: 'https://github.com/MobilityDB/MEOS.js',
			},
		],

		sidebar: {
			'/guide/': [
				{
					text: 'Introduction',
					items: [{ text: 'Getting Started', link: '/guide/getting-started' }],
				},
				{
					text: 'Collections',
					items: [
						{ text: 'Spans', link: '/guide/spans' },
						{ text: 'Span Sets', link: '/guide/spansets' },
						{ text: 'Sets', link: '/guide/sets' },
						{ text: 'Time Types', link: '/guide/time' },
					],
				},
				{
					text: 'Bounding Boxes',
					items: [
						{ text: 'TBox', link: '/guide/tbox' },
						{ text: 'STBox', link: '/guide/stbox' },
					],
				},
				{
					text: 'Temporal Types',
					items: [
						{ text: 'Temporal Scalars', link: '/guide/temporal' },
						{ text: 'Temporal Points', link: '/guide/tpoints' },
					],
				},
				{
					text: 'Advanced',
					items: [
						{ text: 'Error Handling', link: '/guide/errors' },
					],
				},
			],

			'/api/': [
				{
					text: 'API Reference',
					items: [{ text: 'Overview', link: '/api/' }],
				},
				{
					text: 'Base',
					items: [
						{ text: 'Span', link: '/api/classes/Span' },
						{ text: 'SpanSet', link: '/api/classes/SpanSet' },
					],
				},
				{
					text: 'Numbers',
					items: [
						{ text: 'IntSpan', link: '/api/classes/IntSpan' },
						{ text: 'IntSpanSet', link: '/api/classes/IntSpanSet' },
						{ text: 'IntSet', link: '/api/classes/IntSet' },
						{ text: 'FloatSpan', link: '/api/classes/FloatSpan' },
						{ text: 'FloatSpanSet', link: '/api/classes/FloatSpanSet' },
						{ text: 'FloatSet', link: '/api/classes/FloatSet' },
						{ text: 'BigIntSpan', link: '/api/classes/BigIntSpan' },
						{ text: 'BigIntSpanSet', link: '/api/classes/BigIntSpanSet' },
						{ text: 'BigIntSet', link: '/api/classes/BigIntSet' },
					],
				},
				{
					text: 'Text',
					items: [
						{ text: 'TextSet', link: '/api/classes/TextSet' },
					],
				},
				{
					text: 'Time',
					items: [
						{ text: 'DateSpan', link: '/api/classes/DateSpan' },
						{ text: 'DateSpanSet', link: '/api/classes/DateSpanSet' },
						{ text: 'DateSet', link: '/api/classes/DateSet' },
						{ text: 'TsTzSpan', link: '/api/classes/TsTzSpan' },
						{ text: 'TsTzSpanSet', link: '/api/classes/TsTzSpanSet' },
						{ text: 'TsTzSet', link: '/api/classes/TsTzSet' },
					],
				},
				{
					text: 'Bounding Boxes',
					items: [
						{ text: 'TBox', link: '/api/classes/TBox' },
						{ text: 'STBox', link: '/api/classes/STBox' },
					],
				},
				{
					text: 'TBool',
					collapsed: true,
					items: [
						{ text: 'TBool', link: '/api/classes/TBool' },
						{ text: 'TBoolInst', link: '/api/classes/TBoolInst' },
						{ text: 'TBoolSeq', link: '/api/classes/TBoolSeq' },
						{ text: 'TBoolSeqSet', link: '/api/classes/TBoolSeqSet' },
					],
				},
				{
					text: 'TInt',
					collapsed: true,
					items: [
						{ text: 'TInt', link: '/api/classes/TInt' },
						{ text: 'TIntInst', link: '/api/classes/TIntInst' },
						{ text: 'TIntSeq', link: '/api/classes/TIntSeq' },
						{ text: 'TIntSeqSet', link: '/api/classes/TIntSeqSet' },
					],
				},
				{
					text: 'TFloat',
					collapsed: true,
					items: [
						{ text: 'TFloat', link: '/api/classes/TFloat' },
						{ text: 'TFloatInst', link: '/api/classes/TFloatInst' },
						{ text: 'TFloatSeq', link: '/api/classes/TFloatSeq' },
						{ text: 'TFloatSeqSet', link: '/api/classes/TFloatSeqSet' },
					],
				},
				{
					text: 'TText',
					collapsed: true,
					items: [
						{ text: 'TText', link: '/api/classes/TText' },
						{ text: 'TTextInst', link: '/api/classes/TTextInst' },
						{ text: 'TTextSeq', link: '/api/classes/TTextSeq' },
						{ text: 'TTextSeqSet', link: '/api/classes/TTextSeqSet' },
					],
				},
				{
					text: 'TGeomPoint',
					collapsed: true,
					items: [
						{ text: 'TGeomPoint', link: '/api/classes/TGeomPoint' },
						{ text: 'TGeomPointInst', link: '/api/classes/TGeomPointInst' },
						{ text: 'TGeomPointSeq', link: '/api/classes/TGeomPointSeq' },
						{ text: 'TGeomPointSeqSet', link: '/api/classes/TGeomPointSeqSet' },
					],
				},
				{
					text: 'TGeogPoint',
					collapsed: true,
					items: [
						{ text: 'TGeogPoint', link: '/api/classes/TGeogPoint' },
						{ text: 'TGeogPointInst', link: '/api/classes/TGeogPointInst' },
						{ text: 'TGeogPointSeq', link: '/api/classes/TGeogPointSeq' },
						{ text: 'TGeogPointSeqSet', link: '/api/classes/TGeogPointSeqSet' },
					],
				},
				{
					text: 'Enumerations',
					items: [
						{ text: 'TInterpolation', link: '/api/enumerations/TInterpolation' },
						{ text: 'TemporalType', link: '/api/enumerations/TemporalType' },
					],
				},
			],
		},

		search: { provider: 'local' },

		footer: {
			message: '',
			copyright: 'MobilityDB contributors',
		},
	},
});
