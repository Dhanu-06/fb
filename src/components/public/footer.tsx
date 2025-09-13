
export function Footer() {
    return (
        <footer className="bg-background border-t">
            <div className="container mx-auto py-6 px-4 md:px-6 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} ClarityLedger. All rights reserved.</p>
            </div>
        </footer>
    )
}
