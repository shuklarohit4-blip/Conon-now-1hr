with open("scripts/build_cement_storefront.py") as f:
    text = f.read()

# Let's replace {{ and }} in the template
# First find template = """ ... """
parts = text.split('template = """')
header = parts[0]
body_footer = parts[1].split('"""\n\nfinal_content')
body = body_footer[0]
footer = '"""\n\nfinal_content' + body_footer[1]

# In body, replace all {{ with { and }} with }
clean_body = body.replace("{{", "{").replace("}}", "}")

with open("scripts/build_cement_storefront.py", "w") as f:
    f.write(header + 'template = """' + clean_body + footer)

print("Template braces cleaned up!")
