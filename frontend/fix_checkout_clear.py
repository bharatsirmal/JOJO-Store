file_path = "src/components/CheckoutClient.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add a state to track quote failure
if "const [quoteError, setQuoteError]" not in content:
    content = content.replace(
        "const [isLoading, setIsLoading] = useState(true);",
        "const [isLoading, setIsLoading] = useState(true);\n  const [quoteError, setQuoteError] = useState(false);"
    )
    
    # Update fetchQuote to set the error
    content = content.replace(
        "setQuote(data);",
        "setQuote(data);\n        setQuoteError(false);"
    )
    content = content.replace(
        "toast.error(\"Cart items are invalid or no longer exist. Please clear your cart.\");",
        "toast.error(\"Cart items are invalid or no longer exist. Please clear your cart.\");\n        setQuoteError(true);"
    )
    content = content.replace(
        "toast.error(\"Failed to connect to checkout service.\");",
        "toast.error(\"Failed to connect to checkout service.\");\n      setQuoteError(true);"
    )
    
    # Add a UI element for the quote error above the place order button
    button_section = """            <button 
              type="button" 
              onClick={handleCheckout}"""
              
    error_ui = """            {quoteError && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm mb-4">
                <p className="font-semibold mb-2">Checkout Unavailable</p>
                <p className="mb-3">Some items in your cart no longer exist in the store catalog. You must clear your cart to proceed.</p>
                <button 
                  type="button"
                  onClick={() => { clearCart(); router.push("/products"); }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors w-full"
                >
                  Clear Cart & Continue Shopping
                </button>
              </div>
            )}
            
            <button 
              type="button" 
              onClick={handleCheckout}"""
              
    content = content.replace(button_section, error_ui)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

