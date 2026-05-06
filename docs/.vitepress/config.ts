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
				link: 'https://github.com/Nyuke235/MEOS.js',
			},
		],

		sidebar: {
			'/guide/': [
				{
					text: 'Introduction',
					items: [{ text: 'Getting Started', link: '/guide/getting-started' }],
				},
				{
					text: 'Core Types',
					items: [
						{ text: 'Spans', link: '/guide/spans' },
						{ text: 'Span Sets', link: '/guide/spansets' },
						{ text: 'Sets', link: '/guide/sets' },
						{ text: 'Time Types', link: '/guide/time' },
						{ text: 'Temporal Bounding Box', link: '/guide/tbox' },
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
						{ text: 'MeoSet', link: '/api/classes/MeoSet' },
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
					text: 'Bounding Box',
					items: [{ text: 'TBox', link: '/api/classes/TBox' }],
				},
				{
					text: 'Temporal',
					items: [
						{ text: 'TBool', link: '/api/classes/TBool' },
						{ text: 'TInt', link: '/api/classes/TInt' },
						{ text: 'TFloat', link: '/api/classes/TFloat' },
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
