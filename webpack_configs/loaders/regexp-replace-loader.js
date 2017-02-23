module.exports = function (source) {
  var query = this.query;
  var re = new RegExp(query.match.pattern, query.match.flags);
  return source.replace(re, query.replaceWith);
};
