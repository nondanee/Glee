function createElement(tagName,className,innerHTML){
	let element = document.createElement(tagName)
	if(className) element.className = className
	if(innerHTML) element.innerHTML = innerHTML 
	return element
}