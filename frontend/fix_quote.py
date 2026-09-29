file_path = "src/components/CheckoutClient.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "const [isLoading, setIsLoading] = useState(false);",
    "const [isLoading, setIsLoading] = useState(false);\n  const [quoteError, setQuoteError] = useState(false);"
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

