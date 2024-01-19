const
AE = ( $, _ ) => $.appendChild( document.createElement( _ ) )
const
AT = ( $, _ ) => $.appendChild( document.createTextNode( _ ) )

export class
JPObjectEditor extends HTMLElement {

	constructor( $, ParentAndKey ) {
		super()

		this.$ = $
		this.ParentAndKey = ParentAndKey
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
		const anchor = AE( this, 'a' )
		anchor.onclick = () => (
			this.toggleAttribute( 'open' )
		,	this.ObjectOrArray( openP, closeP )
		)
		anchor.textContent = '(' + Object.keys( this.$ ).length + ')'
		if ( this.getAttribute( 'open' ) != null ) {
			AT( this, openP )
			Object.entries( this.$ ).forEach(
				( [ k, v ] ) => {
					const div = AE( this, 'div' )
					AE( div, 'span' ).onclick = () => (
						this.eraser( k )
					,	this.Refresh()
					)
					AT( div, k )
					div.appendChild( new JPObjectEditor( v, [ this, k ] ) )
				}
			)
			AT( this, closeP )
		} else {
			AT( this, openP + '...' + closeP )
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
			case Object	:
				this.eraser = _ => delete this.$[ _ ]
				this.ObjectOrArray( '{', '}' )
				break
			case Array	:
				this.eraser = _ => this.$.splice( _, 1 )
				this.ObjectOrArray( '[', ']' )
				break
			case String	:
				{	const input = AE( this, 'input' )
					input.value = this.$
					input.onchange = () => {
						if ( this.ParentAndKey === void 0 ) {
							this.$ = input.value
						} else {
							const [ parent, key ] = this.ParentAndKey
							parent.$[ key ] = input.value
							parent.Refresh()
						}
					}
				}
				break
			case Number	:
				{	const input = AE( this, 'input' )
					input.value = this.$
					input.onchange = () => {
						const _ = Number( input.value )
						if ( this.ParentAndKey === void 0 ) {
							_ === NaN
							?	this.$ = input.value = 0
							:	this.$ = _
						}

								
							this.$ = _ === NaN ? 
						} else {
							const [ parent, key ] = this.ParentAndKey
							parent.$[ key ] = _
							parent.Refresh()
						}
					}
				}
				break
			default		:
				this.textContent = this.$
				break
			}
			break
		}
	}
}
export default JPObjectEditor
customElements.define( 'jp-object-editor', JPObjectEditor )
