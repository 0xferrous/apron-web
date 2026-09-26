{ pkgs, lib, config, ... }:

{
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_24;
  };

  # wrangler deploys the site by hand; CI deploys on merge to main.
  packages = [ pkgs.git pkgs.wrangler ];

  processes = lib.optionalAttrs (!config.devenv.isTesting) {
    web.exec = "npm run dev -- --host 127.0.0.1 --port 5173 --strictPort";
  };

  enterTest = ''
    npm ci
    npm run check
    npm test
    npm run build
  '';
}
