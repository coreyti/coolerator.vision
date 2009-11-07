function module(name, definition) {
  var current_constructor;

  if (!window[name]) {
    window[name] = {};
  }
  var module_stack = [window[name]];

  function current_module() {
    return module_stack[module_stack.length -1];
  }

  function push_module(name) {
    if (!current_module()[name]) {
      current_module()[name] = {};
    }
    var module = current_module()[name];
    module_stack.push(module);
    return module;
  }

  function pop_module() {
    module_stack.pop();
  }

  var keywords = {
    module: function(name, definition) {
      var module = push_module(name);
      definition.call(module);
      pop_module();
    },

    constructor: function(name, definition) {
      current_constructor = function() {
        if (this.initialize) {
          this.initialize.apply(this, arguments);
        }
      };
      definition.call(current_constructor);
      current_module()[name] = current_constructor;
      current_constructor = undefined;
    },

    include: function(mixin) {
      for (var slot_name in mixin) {
        current_constructor.prototype[slot_name] = mixin[slot_name];
      }
    },

    def: function(name, fn) {
      if(current_constructor) {
        current_constructor.prototype[name] = fn;
      } else {
        current_module()[name] = fn;
      }
    }
  }

  definition.call(current_module(), keywords);
}

function throw_june_unimplemented(object, method){
  throw new Error("June.UnimplementedException: '" + method + "' was not implemented by: " + object);
}

module("Prez", function(c) { with(c) {
  constructor("Builder", function() {

    var supported_tags = [
      'a', 'acronym', 'address', 'area', 'b', 'base', 'bdo', 'big', 'blockquote', 'body',
      'br', 'button', 'caption', 'cite', 'code', 'dd', 'del', 'div', 'dl', 'dt', 'em',
      'fieldset', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'hr', 'html', 'i',
      'img', 'iframe', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'link', 'map',
      'meta', 'noframes', 'noscript', 'ol', 'optgroup', 'option', 'p', 'param', 'pre',
      'samp', 'script', 'select', 'small', 'span', 'strong', 'style', 'sub', 'sup',
      'table', 'tbody', 'td', 'textarea', 'th', 'thead', 'title', 'tr', 'tt', 'ul', 'var'
    ];

    var event_types = [
      "blur", "change", "click", "dblclick", "error", "focus", "keydown", "keypress",
      "keyup", "load", "mousedown", "mousemove", "mouseout", "mouseover", "mouseup",
      "resize", "scroll", "select", "submit", "unload"
    ];


    function generate_tag_method(tag_name) {
      def(tag_name, function() {
        return this.tag_with_array_args(tag_name, arguments);
      });
    }

    function generate_event_handler_method(event_type) {
      def(event_type, function(fn) {
        this.doc.push(new Prez.PostProcessorInstruction('bind', [event_type, null, fn]));
      });
    }

    jQuery.each(supported_tags, function() {
      generate_tag_method(this);
    });

    jQuery.each(event_types, function() {
      generate_event_handler_method(this);
    });


    def("initialize", function() {
      this.doc = [];
    });

    def("tag", function() {
      if(arguments.length > 3) {
        throw("XmlBulider#tag does not accept more than three arguments");
      }
      var tag_name, attributes, value;
      tag_name = arguments[0];

      var arg1 = arguments[1];
      if(typeof arg1 == 'object') {
        attributes = arg1;
        var arg2 = arguments[2];
        if(typeof arg2 == 'function' || typeof arg2 == 'string'){
          value = arg2;
        };
      } else if(typeof arg1 == 'function' || typeof arg1 == 'string'){
        value = arg1;
        var arg2 = arguments[2];
        if(typeof arg2 == 'object') {
          attributes = arg2;
        }
      };

      if (this.is_self_closing(tag_name)) {
        this.doc.push(new Prez.SelfClosingTag(tag_name, attributes));
      } else {
        this.doc.push(new Prez.OpenTag(tag_name, attributes));
        if(typeof value == 'function') {
          value.call(this);
        } else if(typeof value == 'string') {
          this.doc.push(new Prez.Text(value));
        }
        this.doc.push(new Prez.CloseTag(tag_name));
      }

      return this;
    });

    def("self_closing_tag_hash", { 'br': 1, 'hr': 1, 'input': 1, 'img': 1 });

    def("is_self_closing", function(tag_name){
      return this.self_closing_tag_hash[tag_name];
    });

    def("tag_with_array_args", function(tag, args) {
      if(!args) return this.tag(tag);

      var new_arguments = [tag];
      for(var i=0; i < args.length; i++) {
        new_arguments.push(args[i]);
      }
      return this.tag.apply(this, new_arguments);
    });

    def("rawtext", function(value) {
      this.doc.push(new Prez.Text(value));
    });

    def("text", function(value) {
      var html = this.escape_html(value);
      this.doc.push(new Prez.Text(html));
    });

    def("escape_html", function(html) {
      return html.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;")
    });

    def("subview", function(name, template, initial_attributes) {
      this.doc.push(new Prez.PostProcessorInstruction('open_subview', [name]))
      template.content(this, initial_attributes);
      this.doc.push(new Prez.PostProcessorInstruction('close_view', [template, initial_attributes]))
    });

    def("keyed_subview", function(name, key, template, initial_attributes) {
      this.doc.push(new Prez.PostProcessorInstruction('open_subview', [name, key]))
      template.content(this, initial_attributes);
      this.doc.push(new Prez.PostProcessorInstruction('close_view', [template, initial_attributes]))
    });

    def("bind", function() {
      var type = arguments[0];
      if (arguments.length > 2) {
        var data = arguments[1];
        var fn = arguments[2];
      } else {
        var data = null;
        var fn = arguments[1];
      }

      this.doc.push(new Prez.PostProcessorInstruction('bind', [type, data, fn]));
    });

    def("to_string", function() {
      var output = "";
      for(var i=0; i < this.doc.length; i++) {
        var element = this.doc[i];
        output += element.to_string();
      }
      return output;
    });

    def("to_view", function(template, initial_attributes) {
      var string = this.to_string();
      if (string == "") return "";
      var post_processor = new Prez.PostProcessor($(string));
      for(var i=0; i < this.doc.length; i++) {
        var element = this.doc[i];
        element.post_process(post_processor);
      }
      post_processor.close_view(template, initial_attributes);
      return post_processor.root_view;
    });
  });
}});
module("Prez", function(c) { with(c) {
  constructor("PostProcessor", function() {
    def("initialize", function(root_view) {
      this.root_view = root_view;
      this.view_stack = [root_view];
      this.selector_stack = [0];
    });

    def("push", function() {
      this.add_child();
      this.selector_stack.push(0);
    });

    def("add_child", function() {
      if (!this.selector_stack.length == 0) {
        this.selector_stack[this.selector_stack.length - 1]++;
      }
    });

    def("pop", function() {
      this.selector_stack.pop();
    });

    def("open_subview", function(name, key) {
      var view = this.next_element();
      var current_view = this.current_view();
      if (!key) {
        current_view[name] = view;
      } else {
        if (!current_view[name]) {
          current_view[name] = {};
        }
        current_view[name][key] = view;
      }
      view.parent = current_view;
      this.view_stack.push(view);
    });

    def("close_view", function(template, initial_attributes) {
      var current_view = this.current_view();
      if (template && template.methods) {
        $.extend(current_view, template.methods);
      }
      if (template && template.configuration) {
        current_view.configuration = template.configuration;
      }
      if (initial_attributes) {
        $.extend(current_view, initial_attributes);
      }
      if (current_view.initialize) {
        current_view.initialize();
      }
      this.view_stack.pop();
    });

    def("bind", function(type, data, fn) {
      var view = this.current_view();
      this.previous_element().bind(type, data, function(event) {
        fn(event, view);
      });
    });

    def("next_element", function() {
      return this.find_element(this.next_selector());
    });

    def("previous_element", function() {
      if(this.selector_stack.length == 1) {
        if (this.root_view.length == 1) {
          return this.root_view;
        } else {
          return this.root_view.eq(this.num_root_children() - 1);
        }
      } else {
        return this.find_element(this.previous_selector());
      }
    });

    def("find_element", function(selector) {
      if(this.root_view.length == 1) {
        return this.root_view.find(selector);
      } else {
        return this.root_view.eq(this.num_root_children() - 1).find(selector);
      }
    });

    def("num_root_children", function() {
      return this.selector_stack[0];
    });

    def("next_selector", function() {
      return this.selector(true)
    });

    def("previous_selector", function() {
      return this.selector(false)
    });

    def("selector", function(next) {
      var selectors = [];
      for(var i = 1; i < this.selector_stack.length; i++) {
        if (i == this.selector_stack.length - 1) {
          var index = next ? this.selector_stack[i] + 1 : this.selector_stack[i];
          selectors.push(":nth-child(" + index + ")")
        } else {
          selectors.push(":nth-child(" + this.selector_stack[i] + ")")
        }
      }
      return "> " + selectors.join(" > ");
    });

    def("current_view", function() {
      return this.view_stack[this.view_stack.length - 1];
    });
  });
}});
module("Prez", function(c) { with(c) {
  constructor("OpenTag", function() {
    def("initialize", function(tag_name, attributes) {
      this.tag_name = tag_name;
      this.attributes = attributes;
    });

    def("to_string", function() {
      var serialized_attributes = [];
      for(var attributeName in this.attributes) {
        serialized_attributes.push(attributeName + '="' + this.attributes[attributeName] + '"');
      }
      if(serialized_attributes.length > 0) {
        return "<" + this.tag_name + " " + serialized_attributes.join(" ") + ">";
      } else {
        return "<" + this.tag_name + ">";
      }
    })

    def("post_process", function(processor) {
      processor.push();
    });
  });
}});
module("Prez", function(c) { with(c) {
  constructor("CloseTag", function() {
    def("initialize", function(tag_name) {
      this.tag_name = tag_name;
    });

    def("to_string", function() {
      return "</" + this.tag_name + ">";
    });

    def("post_process", function(processor) {
      processor.pop();
    });
  });
}});
module("Prez", function(c) { with(c) {
  constructor("SelfClosingTag", function() {
    def("initialize", function(tag_name, attributes) {
      this.tag_name = tag_name;
      this.attributes = attributes;
    });

    def('to_string', function() {
      var serialized_attributes = [];
      for(var attributeName in this.attributes) {
        serialized_attributes.push(attributeName + '="' + this.attributes[attributeName] + '"');
      }
      if(serialized_attributes.length > 0) {
        return "<" + this.tag_name + " " + serialized_attributes.join(" ") + " />";
      } else {
        return "<" + this.tag_name + " />";
      }
    });

    def('post_process', function(processor) {
      processor.push();  // we increase the parent's number of children
      processor.pop();   // but then remove this child -- it can have no children itself.  Parent's child count remains incremented.
    });
  });
}});
module("Prez", function(c) { with(c) {
  constructor("Text", function() {
    def("initialize", function(value) {
      this.value = value;
    });


    def("to_string", function() {
      return this.value;
    });

    def("post_process", function(processor) {
    });
  });
}});
module("Prez", function(c) { with(c) {
  constructor("PostProcessorInstruction", function() {
    def("initialize", function(function_name, arguments) {
      this.function_name = function_name;
      this.arguments = arguments;
    });

    def("to_string", function() {
      return "";
    });

    def("post_process", function(processor) {
      processor[this.function_name].apply(processor, this.arguments);
    });
  });
}});

module("Prez", function(c) { with(c) {
  def("build", function(fn_or_template, initial_attributes) {
    var builder = new Prez.Builder();

    if (fn_or_template instanceof Function) {
      fn_or_template(builder, initial_attributes);
    } else {
      fn_or_template.content(builder, initial_attributes);
    }

    return builder.to_view(fn_or_template, initial_attributes);
  });

  def("inherit", function(layout, template) {
    var merged_template = $.extend(true, {}, layout, template);

    merged_template.methods = merged_template.methods || {};

    merged_template.methods.initialize = function() {
      if(layout.methods && layout.methods.initialize) {
        layout.methods.initialize.call(this);
      }
      if(template.methods && template.methods.initialize) {
        template.methods.initialize.call(this);
      }
    };

    return merged_template;
  });
}});

