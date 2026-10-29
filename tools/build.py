# -*- coding: utf-8 -*-
"""DMR_SEVK.html dosyasını src/ parçalarından derler."""
import io
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "DMR_SEVK.html")


def read(name):
    with io.open(os.path.join(ROOT, "src", name), encoding="utf-8") as f:
        return f.read()


def main():
    html = read("index.html")
    parts = {
        "{{STYLES}}": read("styles.css"),
        "{{XLSX}}": read("xlsx.js"),
        "{{CORE}}": read("core.js"),
        "{{UI}}": read("ui.js"),
    }
    for key, value in parts.items():
        if key not in html:
            print("Eksik yer tutucu:", key)
            return 1
        html = html.replace(key, value)

    if "</script>" in parts["{{UI}}"] or "</script>" in parts["{{XLSX}}"] or "</script>" in parts["{{CORE}}"]:
        print("UYARI: JS içinde </script> var")

    with io.open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write(html)

    size = os.path.getsize(OUT)
    print("yazıldı:", OUT, "%.1f KB" % (size / 1024.0))
    return 0


if __name__ == "__main__":
    sys.exit(main())
