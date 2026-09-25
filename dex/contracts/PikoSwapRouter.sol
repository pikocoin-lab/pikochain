// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PikoSwapPair.sol";
import "./PikoSwapFactory.sol";

interface IERC20Full {
    function balanceOf(address) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function approve(address spender, uint256 value) external returns (bool);
}

interface IWPIKO {
    function deposit() external payable;
    function withdraw(uint256) external;
    function transfer(address to, uint256 value) external returns (bool);
}

/// @title PikoSwapRouter - liquidity + swaps (Uniswap V2 style)
contract PikoSwapRouter {
    address public immutable factory;
    address public immutable WPIKO;

    modifier ensure(uint256 deadline) {
        require(deadline >= block.timestamp, "expired");
        _;
    }

    constructor(address _factory, address _WPIKO) {
        factory = _factory;
        WPIKO = _WPIKO;
    }

    receive() external payable {
        require(msg.sender == WPIKO, "only WPIKO");
    }

    function _pairFor(address tokenA, address tokenB) internal view returns (address) {
        return PikoSwapFactory(factory).getPair(tokenA, tokenB);
    }

    // ---- liquidity ----

    function _addLiquidity(
        address tokenA, address tokenB,
        uint256 amountADesired, uint256 amountBDesired,
        uint256 amountAMin, uint256 amountBMin
    ) internal returns (uint256 amountA, uint256 amountB) {
        address pair = _pairFor(tokenA, tokenB);
        if (pair == address(0)) {
            pair = PikoSwapFactory(factory).createPair(tokenA, tokenB);
        }
        (uint112 reserve0, uint112 reserve1,) = PikoSwapPair(pair).getReserves();
        (uint256 reserveA, uint256 reserveB) = tokenA < tokenB
            ? (reserve0, reserve1) : (reserve1, reserve0);
        if (reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            uint256 amountBOptimal = quote(amountADesired, reserveA, reserveB);
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, "insufficient B amount");
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint256 amountAOptimal = quote(amountBDesired, reserveB, reserveA);
                require(amountAOptimal <= amountADesired, "insufficient A optimal");
                require(amountAOptimal >= amountAMin, "insufficient A amount");
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }
    }

    function addLiquidity(
        address tokenA, address tokenB,
        uint256 amountADesired, uint256 amountBDesired,
        uint256 amountAMin, uint256 amountBMin,
        address to, uint256 deadline
    ) external ensure(deadline) returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        (amountA, amountB) = _addLiquidity(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin);
        address pair = _pairFor(tokenA, tokenB);
        IERC20Full(tokenA).transferFrom(msg.sender, pair, amountA);
        IERC20Full(tokenB).transferFrom(msg.sender, pair, amountB);
        liquidity = PikoSwapPair(pair).mint(to);
    }

    /// @notice Add liquidity with native PIKO (auto-wrapped to WPIKO).
    function addLiquidityPIKO(
        address token, uint256 amountTokenDesired,
        uint256 amountTokenMin, uint256 amountPIKOMin,
        address to, uint256 deadline
    ) external payable ensure(deadline) returns (uint256 amountToken, uint256 amountPIKO, uint256 liquidity) {
        (amountToken, amountPIKO) = _addLiquidity(token, WPIKO, amountTokenDesired, msg.value, amountTokenMin, amountPIKOMin);
        address pair = _pairFor(token, WPIKO);
        IERC20Full(token).transferFrom(msg.sender, pair, amountToken);
        IWPIKO(WPIKO).deposit{value: amountPIKO}();
        require(IWPIKO(WPIKO).transfer(pair, amountPIKO), "wpiko transfer failed");
        liquidity = PikoSwapPair(pair).mint(to);
        if (msg.value > amountPIKO) {
            payable(msg.sender).transfer(msg.value - amountPIKO); // refund dust
        }
    }

    function removeLiquidity(
        address tokenA, address tokenB, uint256 liquidity,
        uint256 amountAMin, uint256 amountBMin,
        address to, uint256 deadline
    ) external ensure(deadline) returns (uint256 amountA, uint256 amountB) {
        address pair = _pairFor(tokenA, tokenB);
        IERC20Full(pair).transferFrom(msg.sender, pair, liquidity);
        (uint256 amount0, uint256 amount1) = PikoSwapPair(pair).burn(to);
        (amountA, amountB) = tokenA < tokenB ? (amount0, amount1) : (amount1, amount0);
        require(amountA >= amountAMin && amountB >= amountBMin, "insufficient amounts");
    }

    // ---- swaps ----

    function _swap(uint256[] memory amounts, address[] memory path, address _to) internal {
        for (uint256 i = 0; i < path.length - 1; i++) {
            address pair = _pairFor(path[i], path[i + 1]);
            (address token0,) = path[i] < path[i + 1] ? (path[i], path[i + 1]) : (path[i + 1], path[i]);
            uint256 amountOut = amounts[i + 1];
            (uint256 amount0Out, uint256 amount1Out) =
                path[i] == token0 ? (uint256(0), amountOut) : (amountOut, uint256(0));
            address to = i < path.length - 2 ? _pairFor(path[i + 1], path[i + 2]) : _to;
            PikoSwapPair(pair).swap(amount0Out, amount1Out, to);
        }
    }

    function swapExactTokensForTokens(
        uint256 amountIn, uint256 amountOutMin,
        address[] calldata path, address to, uint256 deadline
    ) external ensure(deadline) returns (uint256[] memory amounts) {
        amounts = getAmountsOut(amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "insufficient output amount");
        IERC20Full(path[0]).transferFrom(msg.sender, _pairFor(path[0], path[1]), amounts[0]);
        _swap(amounts, path, to);
    }

    /// @notice Swap native PIKO for tokens.
    function swapExactPIKOForTokens(
        uint256 amountOutMin, address[] calldata path,
        address to, uint256 deadline
    ) external payable ensure(deadline) returns (uint256[] memory amounts) {
        require(path[0] == WPIKO, "path must start with WPIKO");
        amounts = getAmountsOut(msg.value, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "insufficient output amount");
        IWPIKO(WPIKO).deposit{value: amounts[0]}();
        require(IWPIKO(WPIKO).transfer(_pairFor(path[0], path[1]), amounts[0]), "wpiko transfer failed");
        _swap(amounts, path, to);
    }

    // ---- price helpers ----

    function quote(uint256 amountA, uint256 reserveA, uint256 reserveB) public pure returns (uint256 amountB) {
        require(amountA > 0 && reserveA > 0 && reserveB > 0, "insufficient amounts");
        amountB = amountA * reserveB / reserveA;
    }

    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut)
        public pure returns (uint256 amountOut)
    {
        require(amountIn > 0 && reserveIn > 0 && reserveOut > 0, "insufficient amounts");
        uint256 amountInWithFee = amountIn * 997;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn * 1000 + amountInWithFee;
        amountOut = numerator / denominator;
    }

    function getAmountsOut(uint256 amountIn, address[] memory path)
        public view returns (uint256[] memory amounts)
    {
        require(path.length >= 2, "invalid path");
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        for (uint256 i = 0; i < path.length - 1; i++) {
            address pair = _pairFor(path[i], path[i + 1]);
            require(pair != address(0), "pair missing");
            (uint112 reserve0, uint112 reserve1,) = PikoSwapPair(pair).getReserves();
            (uint256 reserveIn, uint256 reserveOut) = path[i] < path[i + 1]
                ? (reserve0, reserve1) : (reserve1, reserve0);
            amounts[i + 1] = getAmountOut(amounts[i], reserveIn, reserveOut);
        }
    }
}
