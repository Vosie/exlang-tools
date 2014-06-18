Peter Parker
========================
A web spider tools

How to Install
------------------------
type ```npm install``` to download all dependencies.

Usage
------------------------
Just use node index.js to execute.

```
node index.js [config file]
```

An example can be:
```
node index.js wiki-nation.json
```

Config File
------------------------
Config file is a json file. It is comprised of a set of property and command
object. The property is the property name of the output object. The simplest
config file may be:

```
{
  "url": {
    "type": "argv",
    "index": 2
  }
}
```

In this example, Peter Parker fills the third argument to the "url" field of
result object, like:
```
{
  "url": "the url in arguments"
}
```

Supported Commands
------------------------
Peter Parker supports the following types of commands:
* argv
returns the specified index of argv
```
  "url": {
    "type": "argv",
    "index": 2
  }
```
* link
returns the href of the selected a tag. If the position field is omitted, it
returns the first item of selected tags.
```
  "flagURL": {
    "selector": "a:contains('Flag')",
    "position": "2",
    "type": "link"
  },
```
* attr
returns the attribute of the selected element. If the position field is omitted,
it returns the first item of selected elements.
```
  "flagImageURL": {
    "selector": "img[alt*='flag']",
    "type": "attr",
    "position": "2",
    "attr": "src"
  }
```
* links
returns an array of hrefs of the selected a tags.
```
  "flagURL": {
    "selector": "a:contains('Flag')",
    "type": "links"
  },
```
* attrs
returns an array of attributes of the selected elements.
```
  "flagImageURL": {
    "selector": "img[alt*='flag']",
    "type": "attrs",
    "attr": "src"
  }
```
* json-parser
json parser runs another Peter Parker from the selected element(s). If the
selector selects multiple elements, it returns an array of parsed object.
Otherwise, it returns the parsed object directly.
```
"languageList": {
  "selector": "ul li.interlanguage-link",
  "type": "json-parser",
  "config": {
    "url": {
      "selector": "a[lang]",
      "type": "link"
    },
    "lang": {
      "selector": "a[lang]",
      "type": "attr",
      "attr": "lang"
    }
  }
}
```
* peter-parker
peter-parker spwan another Peter Parker to fetch the url and parse the content.

```
  "otherLanguages": {
    "selector": "div#p-lang ul li.interlanguage-link",
    "type": "peter-parker",
    "url": {
      "selector": "a[lang]",
      "type": "link"
    },
    "lang": {
      "selector": "a[lang]",
      "type": "attr",
      "attr": "lang"
    },
    "config": {
      "wikiUrl": {
        "type": "parent-field",
        "field": "url"
      },
      "name": {
        "selector": "div[role='main'] .firstHeading > span",
        "type": "attr",
        "attr": "textContent"
      },
      "lang": {
        "type": "parent-field",
        "field": "lang"
      },
      "shortDesc": {
        "selector": {
          "base": "div[role='main'] .mw-body-content .toc",
          "filter": "prevAll",
          "subSelector": "p"
        },
        "type": "attrs",
        "attr": "textContent"
      }
    }
  }
```

Selector Field
------------------------
The selector field supports simple selector, the css selector, or complex
selector, like the followig example:
```
  "selector": {
    "base": "div[role='main'] .mw-body-content .toc",
    "filter": "prevAll",
    "subSelector": "p"
  },
```
The following is the difinition of each field of complex selector:
* base: It is the base location
* filter: It is the filer applied to the base object. It's the name of jquery's
tree traversal API, like prevAll.
* subSelector: If filter needs an argument as selector, you may specify here.

Conditional Command
------------------------
If there are two commands applied to the same field, Peter Parker supports
conditional command. We can put the "condition" field in command definition,
like:

```
"shortDesc": {
  "condition": "if-empty",
  "selector": "div[role='main'] .mw-body-content p",
  "type": "attrs",
  "attr": "textContent"
}
```

Peter Parker currently only supports "if-empty" condition. It executes only if
the key field, it is "shortDesc" in this case, is null or undefined.
