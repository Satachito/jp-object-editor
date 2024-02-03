const	CE = _ => document.createElement( _ )
const	CT = _ => document.createTextNode( _ )
const	AC = ( $, _ ) => $.appendChild( _ )
const	AE = ( $, _ ) => AC( $, CE( _ ) )
const	AT = ( $, _ ) => AC( $, CT( _ ) )

export default class
JPObject extends HTMLElement {

	constructor( $, ParentAndKey ) {
		super()

		this.$ = $
		this.ParentAndKey = ParentAndKey
	}

	connectedCallback() {
console.log( 'CCB', this.$, this.getAttribute( 'open' ) )
		this.Construct()
	}

	static get observedAttributes() {
		return [ 'open', 'json' ]
	}
	attributeChangedCallback( name, oldValue, newValue ) {
console.log( 'ACC', name, oldValue, newValue )
		name === 'json' && ( this.$ = JSON.parse( newValue ) )
	}

	ObjectOrArray( openP, closeP, remover, appender ) {

		this.innerHTML = ''
		const	anchor = AE( this, 'a' )
		anchor.onclick = () => (
			this.toggleAttribute( 'open' )
		,	this.ObjectOrArray( openP, closeP, remover, appender )
		)
		anchor.textContent = Object.keys( this.$ ).length
		AT( this, openP )
		if ( this.getAttribute( 'open' ) != null ) {
			Object.entries( this.$ ).forEach(
				( [ k, v ] ) => {
					const	div = AE( this, 'div' )
					const	AppendClassedSpan = _ => {
						const	$ = AE( div, 'span' )
						$.classList.add( _ )
						return $
					}
					remover && ( AppendClassedSpan( 'jp-object-remover' ).onclick = () => remover( k ) )
					AppendClassedSpan( 'jp-object-key' ).textContent = k
					AC( div, new JPObject( v, [ this, k ] ) )
				}
			)
		} else {
			AT( this, '...' )
		}
		AT( this, closeP )
		if ( appender ) {
			const	select	= AE( this, 'select' )
			const	AddOption	= _ => AE( select, 'option' ).textContent = _
			AddOption( 'String'		)
			AddOption( 'Number'		)
			AddOption( 'Boolean'	)
			AddOption( 'Object'		)
			AddOption( 'Array'		)
			AddOption( 'null'		)
			const	addB = AE( this, 'span' )
			addB.textContent = '+'
			addB.onclick = () => {
				switch ( select.value ) {
				case 'String'	: appender( ''		); break
				case 'Number'	: appender( 0		); break
				case 'Boolean'	: appender( false	); break
				case 'Object'	: appender( {}		); break
				case 'Array'	: appender( []		); break
				case 'null'		: appender( null	); break
				}
			}
		}
	}

	Top() {
		return this.ParentAndKey ? this.ParentAndKey[ 0 ].Top() : this
	}

	Construct() {
console.log( 'Construct', this.$ )
		const	Rewritable	= () => this.Top().getAttribute( 'rewritable'	) === ''
		const	Appendable	= () => this.Top().getAttribute( 'appendable'	) === ''
		const	Removable	= () => this.Top().getAttribute( 'removable'	) === ''
		const	Broadcast	= () => {
			const	top = this.Top()
			const	_ = top.Broadcaster
			_ && _( top )
		}

		const	ModParent	= _ => {
			if ( this.ParentAndKey === void 0 ) {
				this.$ = _
				this.Construct()
			} else {
				const	[ parent, key ] = this.ParentAndKey
				parent.$[ key ] = _ 
				parent.Construct()
			}
			Broadcast()
		}

		this.innerHTML = ''
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
				this.ObjectOrArray(
					'{'
				,	'}'
				,	Removable()
					?	_ => (
							delete this.$[ _ ]
						,	this.Construct()
						,	Broadcast()
						)
					:	void 0
				,	Appendable()
					?	_ => {
							const	key = prompt( 'input key' )
console.log( 'key:', key )
							switch ( key ) {
							case null:
								break
							case '':
								alert( 'The key must not be a null string:' + key )
								break
							default:
								this.$[ key ] = _
								this.Construct()
								Broadcast()
								break
							}
						}
					:	void 0
				)
				break;
			case Array	:
				this.ObjectOrArray(
					'['
				,	']'
				,	Removable()
					?	_ => (
							this.$.splice( _, 1 )
						,	this.Construct()
						,	Broadcast()
						)
					:	void 0
				,	Appendable()
					?	_ => (
							this.$.push( _ )
						,	this.Construct()
						,	Broadcast()
						)
					:	void 0
				)
				break;
			case String	:
				if ( Rewritable() ) {
					const	input = AE( this, 'textarea' )
					input.value = this.$
					input.onchange = () => ModParent( input.value )
				} else {
					this.textContent = this.$
				}
				break;
			case Number	:
				if ( Rewritable() ) {
					const	input = AE( this, 'input' )
					input.value = this.$
					input.onchange = () => {
						const	_ = Number( input.value )
						if ( isNaN( _ ) ) {
							alert( '"' + input.value + '" is not a number.' )
							input.value = this.$
							return
						}
						ModParent( _ )
					}
				} else {
					this.textContent = this.$
				}
				break;
			case Boolean:
				if ( Rewritable() ) {
					const	input = AE( this, 'input' )
					input.setAttribute( 'type', 'checkbox' )
					input.checked = this.$
					input.onchange = () => ModParent( input.checked )
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
