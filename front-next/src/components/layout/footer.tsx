import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border bg-background-light dark:bg-background-dark">
      <div className="container mx-auto px-6 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div className="space-y-4">
            <h3 className="font-bold text-xl font-display">Marketplace ONG</h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              Conectando consumidores com ONGs parceiras para fazer a diferença.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg font-display">Links</h3>
            <ul className="space-y-3 text-base">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Produtos
                </Link>
              </li>
              <li>
                <Link
                  href="/my-orders"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Meus Pedidos
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg font-display">Suporte</h3>
            <ul className="space-y-3 text-base">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Contato
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border text-center text-base text-muted-foreground">
          © {new Date().getFullYear()} Marketplace ONG. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
