from aea.crypto.registries.base import *
from aea.mail.base_pb2 import DESCRIPTOR
from aea_ledger_cosmos.cosmos import *
from aea_ledger_ethereum.ethereum import *
from aea_ledger_ethereum_flashbots.ethereum_flashbots import *
from google.protobuf.descriptor_pb2 import FileDescriptorProto
from multiaddr.codecs.idna import to_bytes as _
from multiaddr.codecs.uint16be import to_bytes as _

from operate.cli import main


if __name__ == "__main__":
    main()
