# ToyHouse CSS editor
A simple editor that consolidates css code into style attributes primarily for use with https://toyhou.se/

### Why?
ToyHouse's free tier does not allow link or script tags to style the page. This editor allows you to write traditional CSS in a human friendly way and then convert it into style attributes.
### How?
The javascript parses the CSS and rules a querySelectorAll on the html using the selectors as a query. It then appends any style attributes to the html elements.
### Example
HTML:
```html
<div class="example">Hello, World!</div>
```
CSS:
```css
div {
    font-weight: bold;
}

.example {
    color: red;
}
```

output:
```html
<div class="example" style="font-weight: bold; color: red;">Hello, World!</div>
```
