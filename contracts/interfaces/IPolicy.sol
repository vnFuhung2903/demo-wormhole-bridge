// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.27;
interface IPolicy {

    function policy() external view returns (address);

    function renouncePolicy() external;
  
    function pushPolicy( address newPolicy_ ) external;

    function pullPolicy() external;
}