const
AE = ( $, _ ) => $.appendChild( document.createElement( _ ) )
const
AT = ( $, _ ) => $.appendChild( document.createTextNode( _ ) )

export class
JPObject extends HTMLElement {

	constructor( $, ParentAndKey ) {
		super()

		this.$ = $
		this.ParentAndKey = ParentAndKey
		this.classList.add( `jp-object` )
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

	//	Virtual
	NewJPObject( v, k ) {
		return new JPObject( v, [ this, k ] )
	}
	//	Virtual
	ConfigKeySpan( span, k ) {
	}
	ObjectOrArray( openP, closeP ) {
		this.textContent = ''
		const anchor = AE( this, 'a' )
		anchor.onclick = () => (
			this.toggleAttribute( 'open' )
		,	this.ObjectOrArray( openP, closeP )
		)
		anchor.textContent = Object.keys( this.$ ).length
		if ( this.getAttribute( 'open' ) != null ) {
			AT( this, openP )
			Object.entries( this.$ ).forEach(
				( [ k, v ] ) => {
					const div = AE( this, 'div' )
					const span = AE( div, 'span' )
					span.textContent = k
					this.ConfigKeySpan( span, k )
					div.appendChild( this.NewJPObject( v, k, span ) )
				}
			)
			AT( this, closeP )
		} else {
			AT( this, openP + '...' + closeP )
		}
	}

	//	Virtual
	ObjectElement() {
		this.ObjectOrArray( '{', '}' )
	}
	//	Virtual
	ArrayElement() {
		this.ObjectOrArray( '[', ']' )
	}
	//	Virtual
	StringElement() {
		this.textContent = this.$
	}
	//	Virtual
	NumberElement() {
		this.textContent = this.$
	}
	//	Virtual
	BooleanElement() {
		this.textContent = this.$
	}

	Refresh() {
		switch ( this.$ ) {
		case void 0:
			this.classList.add( `jp-object-undefined` )
			break
		case null:
			this.textContent = 'null'
			this.classList.add( `jp-object-null` )
			break
		default:
			this.classList.add( 'jp-object-' + this.$.constructor.name )
			switch ( this.$.constructor ) {
			case Object	: this.ObjectElement()	; break
			case Array	: this.ArrayElement()	; break
			case String	: this.StringElement()	; break
			case Number	: this.NumberElement()	; break
			case Boolean: this.BooleanElement()	; break
			default		:
				this.textContent = this.$
				break
			}
			break
		}
	}
}

export class
JPObjectEditor extends JPObject {

	NewJPObject( v, k ) {
		return new JPObjectEditor( v, [ this, k ] )
	}
	ConfigKeySpan( span, k ) {
		span.onclick = () => (
			this.eraser( k )
		,	this.Refresh()
		)
	}
	ObjectElement() {
		this.eraser = _ => delete this.$[ _ ]
		super.ObjectElement()
	}
	ArrayElement() {
		this.eraser = _ => this.$.splice( _, 1 )
		super.ArrayElement()
	}
	StringElement() {
		const input = AE( this, 'input' )
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
	NumberElement() {
		const input = AE( this, 'input' )
		input.value = this.$
		input.onchange = () => {
			const _ = Number( input.value )
			if ( isNaN( _ ) ) {
				alert( '"' + input.value + '" is not a number.' )
				input.value = this.$
				return
			}
			if ( this.ParentAndKey === void 0 ) {
				this.$ = _
			} else {
				const [ parent, key ] = this.ParentAndKey
				parent.$[ key ] = input.value
				parent.Refresh()
			}
		}
	}
	BooleanElement() {
		const input = AE( this, 'input' )
		input.setAttribute( 'type', 'checkbox' )
		input.checked = this.$
		input.onchange = () => {
			if ( this.ParentAndKey === void 0 ) {
				this.$ = input.checked
			} else {
				const [ parent, key ] = this.ParentAndKey
				parent.$[ key ] = input.checked
				parent.Refresh()
			}
		}
	}
}

customElements.define( 'jp-object', JPObject )
customElements.define( 'jp-object-editor', JPObjectEditor )
