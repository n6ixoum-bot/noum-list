{
  description = "Noum List web development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_22
            pnpm
            git
          ];

          shellHook = ''
            export PLAYWRIGHT_BROWSERS_PATH="''${PLAYWRIGHT_BROWSERS_PATH:-$HOME/.cache/ms-playwright}"
            echo "Noum List web shell ready: Node $(node --version), pnpm $(pnpm --version)"
            echo "Run: pnpm install && pnpm dev"
          '';
        };
      }
    );
}
