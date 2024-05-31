default: build

build:
	cargo rustc --manifest-path=position_manager/Cargo.toml --crate-type=cdylib --target=wasm32-unknown-unknown --release
	mkdir -p target/wasm32-unknown-unknown/optimized
	soroban contract optimize --wasm target/wasm32-unknown-unknown/release/position_manager.wasm --wasm-out target/wasm32-unknown-unknown/optimized/position_manager.wasm

	cd target/wasm32-unknown-unknown/optimized/ && \
		for i in *.wasm ; do \
			ls -l "$$i"; \
		done

fmt:
	cargo fmt --all

clean:
	cargo clean
