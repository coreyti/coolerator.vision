(function($) {
  // $.noConflict();

  Coolerator = {
    DOM : {
      ELEMENT_NODE                : 1,
      ATTRIBUTE_NODE              : 2,
      TEXT_NODE                   : 3,
      CDATA_SECTION_NODE          : 4,
      ENTITY_REFERENCE_NODE       : 5,
      ENTITY_NODE                 : 6,
      PROCESSING_INSTRUCTION_NODE : 7,
      COMMENT_NODE                : 8,
      DOCUMENT_NODE               : 9,
      DOCUMENT_TYPE_NODE          : 10,
      DOCUMENT_FRAGMENT_NODE      : 11,
      NOTATION_NODE               : 12
    },

    REGEX : {
      FUNCTION_BODY : /^[^\{]*{((.*\n*)*)}/m
    }
  };

  $.fn.extend({
    match_for : function match_for(selector) {
      $.each(this, function(i, content) {
        if(Coolerator.DOM.ELEMENT_NODE === content.nodeType) {
          var match = (content = $(content)) && content.is(selector) ? content : content.find(selector);

          return match.length ? match : undefined;
        }
      })
    }
  });
})(jQuery);
