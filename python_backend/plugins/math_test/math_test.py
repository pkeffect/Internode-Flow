class PythonAdd:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "val_a": ("INT", {"default": 0}),
                "val_b": ("INT", {"default": 0}),
            }
        }
    
    RETURN_TYPES = ("INT",)
    FUNCTION = "do_math"
    CATEGORY = "Python/Math"

    def do_math(self, val_a, val_b):
        print(f"Python calculating {val_a} + {val_b}")
        return (val_a + val_b,)

NODE_CLASS_MAPPINGS = {
    "PythonAdd": PythonAdd
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "PythonAdd": "Add (Python Engine)"
}