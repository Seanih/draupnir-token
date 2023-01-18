import Document, { Html, Head, Main, NextScript } from 'next/document';

// APPLY FONTS AND STYLES TO <body> and entire app
class MyDocument extends Document {
	render() {
		return (
			<Html>
				<Head>
					{/* add global fonts here */}
					<link rel='preconnect' href='https://fonts.googleapis.com' />
					<link
						rel='preconnect'
						href='https://fonts.gstatic.com'
						crossOrigin='true'
					/>
					<link
						href='https://fonts.googleapis.com/css2?family=Bona+Nova:ital,wght@0,400;0,700;1,400&family=Eagle+Lake&family=IM+Fell+French+Canon+SC&display=swap'
						rel='stylesheet'
					/>
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
