export default function Footer() {
    return (
        <footer className="bg-primary text-primary-foreground py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">Vedax</h3>
                        <p className="text-sm opacity-80">
                            Gamifying environmental education for a sustainable future.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm opacity-80">
                            <li>Lessons</li>
                            <li>Challenges</li>
                            <li>Schools</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm opacity-80">
                            <li>Blog</li>
                            <li>Impact Report</li>
                            <li>Help Center</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm opacity-80">
                            <li>Privacy Policy</li>
                            <li>Terms of Service</li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center text-sm opacity-60">
                    © {new Date().getFullYear()} Vedax. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
