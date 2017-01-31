"use strict";

var stockTickerUI = {

	updateStockElems(stockInfoChildElemList,data) {
		var getDataVal = curry( reverseArgs( prop ), 2 )( data );
		var extractInfoChildElemVal = pipe(
			getClassName,
			stripPrefix( /\bstock-/i ),
			getDataVal
		);
		var orderedDataVals =
			map( extractInfoChildElemVal )( stockInfoChildElemList );
		var elemsValsTuples =
			filter(
				spreadArgs( function updateValuePresent(infoChildElem,val){
					return val !== undefined;
				} )
			)
			( zip( stockInfoChildElemList, orderedDataVals ) );

		// !!SIDE EFFECTS!!
		compose( each, spreadArgs )
		( setDOMContent )
		( elemsValsTuples );
	},

	updateStock(tickerElem,data) {
		var getStockElemFromId = curry( getStockElem )( tickerElem );
		var stockInfoChildElemList = pipe(
			getStockElemFromId,
			getStockInfoChildElems
		)
		( data.id );

		return stockTickerUI.updateStockElems(
			stockInfoChildElemList,
			data
		);
	},

	addStock(tickerElem,data) {
		var [stockElem, ...infoChildElems] = map(
			createElement
		)
		( [ "li", "span", "span", "span" ] );
		var attrValTuples = [
			[ ["class","stock"], ["data-stock-id",data.id] ],
			[ ["class","stock-name"] ],
			[ ["class","stock-price"] ],
			[ ["class","stock-change"] ]
		];
		var elemsAttrsTuples =
			zip( [stockElem, ...infoChildElems], attrValTuples );

		// !!SIDE EFFECTS!!
		each( function setElemAttrs([elem,attrValTupleList]){
			each(
				spreadArgs( partial( setElemAttr, elem ) )
			)
			( attrValTupleList );
		} )
		( elemsAttrsTuples );

		// !!SIDE EFFECTS!!
		stockTickerUI.updateStockElems( infoChildElems, data );
		reduce( appendDOMChild )( stockElem )( infoChildElems );
		ticker.appendChild( stockElem );
	}

};

var getDOMChildren = flatMap(
	pipe(
		curry( prop )( "childNodes" ),
		Array.from
	)
);
var getElementProp = curry( reverseArgs( getElemAttr ), 2 );
var createElement = document.createElement.bind( document );
var getStockId = getElementProp( "data-stock-id" );
var getClassName = getElementProp( "class" );

// !!SIDE EFFECTS!!
var ticker = document.getElementById( "stock-ticker" );
each(
	spreadArgs( function subscribeObservers(obsv,subscriberFn){
		obsv.subscribe( partial( subscriberFn, ticker ) )
	} )
)
( [
	[ newStocks, stockTickerUI.addStock ],
	[ stockUpdates, stockTickerUI.updateStock ]
] );


// *********************

function stripPrefix(prefixRegex) {
	return function mapperFn(val) {
		return val.replace( prefixRegex, "" );
	};
}

function liftToList(listOrItem) {
	if (!Array.isArray(listOrItem)) return [ listOrItem ];
	return listOrItem;
}

function isRealDOMElement(val) {
	return val && val.getAttribute;
}

function getElemAttr(elem,prop) {
	return elem.getAttribute( prop );
}

function setElemAttr(elem,prop,val) {
	// !!SIDE EFFECTS!!
	return elem.setAttribute( prop, val );
}

function matchingStockId(id) {
	return function isStock(node){
		return getStockId( node ) == id;
	};
}

function isStockInfoChildElem(elem) {
	return /\bstock-/i.test( getClassName( elem ) );
}

function getStockElem(tickerElem,stockId) {
	return pipe(
		liftToList,
		getDOMChildren,
		filter( isRealDOMElement ),
		filter( matchingStockId( stockId ) )
	)
	( tickerElem );
}

function getStockInfoChildElems(stockElem) {
	return pipe(
		liftToList,
		getDOMChildren,
		filter( isRealDOMElement ),
		filter( isStockInfoChildElem )
	)
	( stockElem );
}

function appendDOMChild(parentNode,childNode) {
	// !!SIDE EFFECTS!!
	parentNode.appendChild( childNode );
	return parentNode;
}

function setDOMContent(elem,html) {
	// !!SIDE EFFECTS!!
	elem.innerHTML = html;
	return elem;
}