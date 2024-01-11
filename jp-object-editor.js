const
ACE = ( $, _ ) => $.appendChild( document.createElement( _ ) )
const
ACT = ( $, _ ) => $.appendChild( document.createTextNode( _ ) )

export class
JPObjectEditor extends HTMLElement {

	constructor( $ ) {
		super()

		this.$ = $
	}

	attributeChangedCallback( name, oldValue, newValue ) {
		name === 'json' && (
			this.$ = JSON.parse( newValue )
		,	this.Refresh()
		)
	}

	connectedCallback() {
		this.getAttribute( 'json' ) != null && ( this.$ = JSON.parse( this.getAttribute( 'json' ) ) )
		this.Refresh()
	}

	ObjectOrArray( openP, closeP ) {
		this.textContent = ''
		const anchor = ACE( this, 'a' )
		anchor.onclick = () => (
			this.toggleAttribute( 'open' )
		,	this.ObjectOrArray( openP, closeP )
		)
		anchor.textContent = '(' + Object.keys( this.$ ).length + ')'
		if ( this.getAttribute( 'open' ) != null ) {
			ACT( this, openP )

			Object.entries( this.$ ).forEach(
				( [ k, v ] ) => {
					const div = ACE( this, 'div' )
					ACT( div, k )
					div.appendChild( new JPObjectEditor( v ) )
				}
			)

			ACT( this, closeP )
		} else {
			ACT( this, openP + '...' + closeP )
		}
	}
	Refresh() {
		switch ( this.$ ) {
		case void 0:
			this.classList.add( `jp-object-editor-undefined` )
			this.textContent = 'undefined'
			break
		case null:
			this.classList.add( `jp-object-editor-null` )
			this.textContent = 'null'
			break
		default:
			this.classList.add( 'jp-object-editor-' + this.$.constructor.name )
			switch ( this.$.constructor ) {
			case Object	: this.ObjectOrArray( '{', '}' )	; break
			case Array	: this.ObjectOrArray( '[', ']' )	; break
			default		: this.textContent = this.$			; break
			}
			break
		}
	}
}
export default JPObjectEditor
customElements.define( 'jp-object-editor', JPObjectEditor )
