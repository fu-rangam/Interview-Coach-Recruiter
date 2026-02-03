import { Button } from "@/components/ui/button"

export default function InitialsScreen() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="text-center">
                <h1 className="mb-4 text-2xl font-bold">Welcome</h1>
                <p className="mb-6 text-muted-foreground">Please enter your initials to continue.</p>
                <Button onClick={() => console.log("Initials submitted")}>Continue</Button>
            </div>
        </div>
    )
}
