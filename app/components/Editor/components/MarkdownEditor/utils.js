function findByTextContent(needle, haystack, precise) {
  // needle: String, the string to be found within the elements.
  // haystack: String, a selector to be passed to document.querySelectorAll(),
  //           NodeList, Array - to be iterated over within the function:
  // precise: Boolean, true - searches for that precise string, surrounded by
  //                          word-breaks,
  //                   false - searches for the string occurring anywhere
  var elems;

  // no haystack we quit here, to avoid having to search
  // the entire document:
  if (!haystack) {
    return false;
  }
  // if haystack is a string, we pass it to document.querySelectorAll(),
  // and turn the results into an Array:
  else if ('string' == typeof haystack) {
    elems = [].slice.call(document.querySelectorAll(haystack), 0);
  }
  // if haystack has a length property, we convert it to an Array
  // (if it's already an array, this is pointless, but not harmful):
  else if (haystack.length) {
    elems = [].slice.call(haystack, 0);
  }

  // work out whether we're looking at innerText (IE), or textContent 
  // (in most other browsers)
  // var textProp = 'textContent' in document ? 'textContent' : 'innerText',
  var textProp = 'outerHTML',
    // creating a regex depending on whether we want a precise match, or not:
    reg = precise === true ? new RegExp('\\b' + needle + '\\b') : new RegExp(needle),
    // iterating over the elems array:
    found = elems.filter(function(el) {
      // returning the elements in which the text is, or includes,
      // the needle to be found:
      return reg.test(el[textProp]);
    });
  return found.length ? found : false;;
}

export default findByTextContent
