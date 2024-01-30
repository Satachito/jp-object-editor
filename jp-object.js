const
CE = _ => document.createElement( _ )

const
CT = _ => document.createTextNode( _ )

const
AC = ( $, _ ) => $.appendChild( _ )

const
AE = ( $, _ ) => AC( $, CE( _ ) )

const
AT = ( $, _ ) => AC( $, CT( _ ) )

export default class
JPObject extends HTMLElement {

	constructor( $, ParentAndKey ) {
		super()

		this.$ = $
		this.ParentAndKey = ParentAndKey
	}

	connectedCallback() {
		const	json = this.getAttribute( 'json' )
//		console.log( 'CCB', this.$, json )
		json && ( this.$ = JSON.parse( json ) )
		this.Reconstruct()
	}

	attributeChangedCallback( name, oldValue, newValue ) {
//		console.log( 'ACC', name, newValue )
		name === 'json' && ( this.$ = JSON.parse( newValue ) )
		this.Reconstruct()
	}

	Top() {
		return this.ParentAndKey ? this.ParentAndKey[ 0 ].Top() : this
	}

	Editable() {
		return this.Top().getAttribute( 'editable'		) === ''
	}
	Appendable() {
		return this.Top().getAttribute( 'appendable'	) === ''
	}
	Removable() {
		return this.Top().getAttribute( 'removable'		) === ''
	}

	Broadcast() {
		this.parentAndKey
		?	this.ParentAndKey[ 0 ].Broadcast()
		:	this.Broadcaster( this )
	}

	ObjectOrArray( openP, closeP, remover, appender, keyElement ) {
		this.innerHTML = ''
		const anchor = AE( this, 'a' )
		anchor.onclick = () => (
			this.toggleAttribute( 'open' )
		,	this.ObjectOrArray( openP, closeP, remover, appender )
		)
		anchor.textContent = Object.keys( this.$ ).length
		if ( this.getAttribute( 'open' ) != null ) {
			AT( this, openP )
			Object.entries( this.$ ).forEach(
				( [ k, v ] ) => {
					const div = AE( this, 'div' )
					const span = AE( div, 'span' )
					span.classList.add( 'jp-object-key' )
					span.textContent = k
					this.Removable() && (
						span.onclick = () => {
							remover( k )
							this.Reconstruct()
						}
					)
					AC( div, new JPObject( v, [ this, k ] ) )
				}
			)
			AT( this, closeP )
		} else {
			AT( this, openP + '...' + closeP )
		}
		if ( this.Appendable() ) {
			if ( keyElement ) AC( this, keyElement )
			const select	= AE( this, 'select' )
			const AddOption	= _ => AE( select, 'option' ).textContent = _
			AddOption( 'String' )
			AddOption( 'Number' )
			AddOption( 'Boolean' )
			AddOption( 'Object' )
			AddOption( 'Array' )
			AddOption( 'null' )
			const addB = AE( this, 'span' )
			addB.textContent = '+'
			addB.onclick = () => {
				switch ( select.value ) {
				case 'String'	: appender( '' )	; break
				case 'Number'	: appender( 0 )		; break
				case 'Boolean'	: appender( false )	; break
				case 'Object'	: appender( {} )	; break
				case 'Array'	: appender( [] )	; break
				case 'null'		: appender( null )	; break
				}
				this.Reconstruct()
				this.Broadcast()
			}
		}
	}

	Reconstruct() {
		switch ( this.$ ) {
		case void 0:
			this.classList.add( `jp-object-undefined` )
			break
		case null:
			this.classList.add( `jp-object-null` )
			this.textContent = 'null'
			break
		default:
			this.classList.add( 'jp-object-' + this.$.constructor.name )
			switch ( this.$.constructor ) {
			case Object	:
				{	const keyElement = CE( 'input' )
					keyElement.classList.add( 'jp-object-key-name' )
					keyElement.setAttribute( 'placeholder', 'Key:' )
					this.ObjectOrArray(
						'{'
					,	'}'
					,	_ => delete this.$[ _ ]
					,	_ => {
							const key = keyElement.value
							this.$[ key ] = _
						}
					,	keyElement
					)
				}
				break;
			case Array	:
				this.ObjectOrArray(
					'['
				,	']'
				,	_ => this.$.splice( _, 1 )
				,	_ => this.$.push( _ )
				)
				break;
			case String	:
				if ( this.Editable() ) {
					const input = AE( this, 'input' )
					input.value = this.$
					input.onchange = () => {
						if ( this.ParentAndKey === void 0 ) {
							this.$ = input.value
						} else {
							const [ parent, key ] = this.ParentAndKey
							parent.$[ key ] = input.value
							parent.Reconstruct()
						}
						this.Broadcast()
					}
				} else {
					this.textContent = this.$
				}
				break;
			case Number	:
				if ( this.Editable() ) {
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
							parent.Reconstruct()
						}
						this.Broadcast()
					}
				} else {
					this.textContent = this.$
				}
				break;
			case Boolean:
				if ( this.Editable() ) {
					const input = AE( this, 'input' )
					input.setAttribute( 'type', 'checkbox' )
					input.checked = this.$
					input.onchange = () => {
						if ( this.ParentAndKey === void 0 ) {
							this.$ = input.checked
						} else {
							const [ parent, key ] = this.ParentAndKey
							parent.$[ key ] = input.checked
							parent.Reconstruct()
						}
						this.Broadcast()
					}
				} else {
					this.textContent = this.$
				}
				break;
			default		:
				this.textContent = this.$
				break
			}
			break
		}
	}
}

customElements.define( 'jp-object', JPObject )
